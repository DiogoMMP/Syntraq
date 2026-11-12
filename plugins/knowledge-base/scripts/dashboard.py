#!/usr/bin/env python3
"""Knowledge-base dashboard: install, build and feed a KB's dashboard.

Standard library only. The `dashboard` skill copies this file into the KB as
.dashboard/dashboard.py, so every skill can call it at a fixed path:

  python .dashboard/dashboard.py build            rebuild .dashboard/data.js (the page's snapshot)
  python .dashboard/dashboard.py event SKILL "summary" [--area A] [--count N] [--data JSON]
                                                  log one activity event, then rebuild
  python <plugin>/scripts/dashboard.py scan <kb>  facts for the dashboard skill (JSON on stdout)
  python <plugin>/scripts/dashboard.py install <kb>
                                                  copy the page and this script into <kb>

`<kb>` defaults to the KB this file sits in when it runs from .dashboard/.

The script never interprets. It lists, counts and parses fixed formats
(frontmatter, markdown tables, checkboxes, the JSON files under
.dashboard/data/). What things mean is decided by skills and written to those
JSON files; see the plugin's references/dashboard-data.md.
"""
from __future__ import annotations

import datetime as dt
import fnmatch
import json
import os
import re
import shutil
import sys
import unicodedata
import uuid
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP_SRC = HERE / "dashboard_app"          # app.js, app.css, dashboard.html in the plugin
DASH = ".dashboard"
PAGE = "dashboard.html"

ALWAYS_SKIP = {"desktop.ini", "thumbs.db", ".ds_store"}
WIKI_SPECIAL = {"readme.md", "index.md", "sources.md"}
BOOKKEEPING = {"assessment", "quiz", "progress"}   # study bookkeeping, never "material"
OUTPUT_EXTS = {"md", "pdf", "docx", "pptx", "xlsx", "html", "ics", "apkg", "txt", "csv"}
HEAT_SKIP_EXTS = {"py", "pyc", "pl", "json", "png", "jpg", "jpeg", "svg"}
DATE_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")
# "Last compiled" in wiki/sources.md: YYYY-MM-DDTHH:MM (local time), or a bare
# date in rows written before compile-wiki recorded the time.
COMPILED_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})(?:[T ](\d{1,2}):(\d{2}))?\b")
DAY_HEADING_RE = re.compile(r"^#{2,4}\s+(\d{4}-\d{2}-\d{2})\b(.*)$")
CHECK_RE = re.compile(r"^\s*[-*]\s+\[([ xX])\]\s+(.*)$")
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")
NUM_RE = re.compile(r"(\d+(?:[.,]\d+)?)")
SMALL_WORDS = {"de", "da", "do", "das", "dos", "e", "a", "o", "em", "no", "na", "para", "com",
               "of", "the", "and", "for", "in", "on", "to"}


# ---------------------------------------------------------------- helpers

def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def key(s: str) -> str:
    """Comparison key for paths and names: NFC, forward slashes, case-folded."""
    return nfc(s).replace("\\", "/").strip().strip("/").casefold()


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "area"


def rel(p: Path, root: Path) -> str:
    return nfc(p.relative_to(root).as_posix())


def mtime_date(p: Path) -> str:
    return dt.date.fromtimestamp(p.stat().st_mtime).isoformat()


def mtime_minute(p: Path) -> str:
    return dt.datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%dT%H:%M")


def compiled_value(cells) -> str:
    """The last "last compiled" value in a manifest row, normalised to
    YYYY-MM-DDTHH:MM, or YYYY-MM-DD for an old date-only row."""
    found = [m for c in cells for m in COMPILED_RE.finditer(c)]
    if not found:
        return ""
    d, h, mi = found[-1].groups()
    return f"{d}T{int(h):02d}:{mi}" if h else d


def up_to_date(mtime_min: str, compiled: str) -> bool:
    """True when a file didn't change after its "last compiled" value: to the
    minute for a timestamp, by day for an old date-only row."""
    if not compiled:
        return False
    if len(compiled) > 10:
        return mtime_min <= compiled
    return mtime_min[:10] <= compiled


def walk(root: Path):
    """Every file under root, following junctions/symlinks (raw/ is often one).

    Only a link back to one of the folders above it on the current path (a
    real cycle) is skipped; two paths reaching the same folder both count.
    """
    if not root.exists():
        return

    def visit(folder: str, ancestors: frozenset):
        real = os.path.realpath(folder)
        if real in ancestors:
            return
        chain = ancestors | {real}
        try:
            entries = sorted(os.scandir(folder), key=lambda e: e.name)
        except OSError:
            return
        for e in entries:
            if e.name.startswith("."):
                continue
            if e.is_dir(follow_symlinks=True):
                yield from visit(e.path, chain)
            elif not (e.name.startswith("~$") or e.name.lower() in ALWAYS_SKIP):
                yield Path(e.path)

    yield from visit(str(root), frozenset())


def read(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def read_json(p: Path, default=None):
    try:
        return json.loads(read(p)) if p.exists() else default
    except json.JSONDecodeError as e:
        print(f"warning: {p} is not valid JSON ({e}); ignored", file=sys.stderr)
        return default


def write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(f"{p.name}.{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, p)


def frontmatter(text: str) -> dict:
    """Minimal YAML frontmatter: scalars, inline [lists] and '- item' lists.

    '- name: value' list items become {"name": "value"} dicts. Enough for the
    KB's own templates; anything fancier comes back as a raw string.
    """
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    data: dict = {}
    current = None
    for line in text[3:end].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        item = re.match(r"^\s+-\s+(.*)$", line) or (re.match(r"^-\s+(.*)$", line) if current else None)
        if item and current is not None:
            val = item.group(1).strip()
            m = re.match(r"^([^:]+):\s*(.*)$", val)
            if m and not val.startswith(("http", '"', "'")):
                val = {m.group(1).strip().strip("\"'"): m.group(2).strip().strip("\"'")}
            else:
                val = val.strip("\"'")
            if not isinstance(data.get(current), list):
                data[current] = []
            data[current].append(val)
            continue
        m = re.match(r"^([A-Za-z0-9_\-]+):\s*(.*)$", line)
        if m:
            k, v = m.group(1), m.group(2).split(" #")[0].strip()
            current = k
            if v.startswith("[") and v.endswith("]"):
                data[k] = [x.strip().strip("\"'") for x in v[1:-1].split(",") if x.strip()]
            else:
                data[k] = v.strip("\"'") if v else []
    return data


def md_tables(text: str):
    """Yield each markdown table as a list of rows (list of cell strings), header first."""
    rows: list = []
    for line in text.splitlines() + [""]:
        s = line.strip()
        if s.startswith("|") and s.endswith("|") and len(s) > 1:
            cells = [c.strip() for c in s[1:-1].split("|")]
            if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
                continue
            rows.append(cells)
        elif rows:
            yield rows
            rows = []


def clean_cell(c: str) -> str:
    c = c.strip().strip("`")
    m = re.match(r"^\[[^\]]*\]\(([^)]+)\)$", c)  # [text](path)
    if m:
        c = m.group(1)
    c = c.strip("[]").strip()
    c = re.sub(r"^(\.\./)?raw/", "", c)
    return c.replace("%20", " ")


def matches(path: str, patterns) -> bool:
    p = key(path)
    for pat in patterns or []:
        q = key(pat)
        if q.endswith("/**"):
            if p == q[:-3] or p.startswith(q[:-3] + "/"):
                return True
        elif fnmatch.fnmatchcase(p, q) or p.startswith(q.rstrip("/") + "/"):
            return True
    return False


def under(path: str, prefixes) -> bool:
    p = key(path)
    for pre in prefixes or []:
        q = key(pre)
        if q in ("", ".") or p == q or p.startswith(q + "/"):
            return True
    return False


def folder_title(name: str) -> str:
    """Mechanical fallback for the KB's display name ('my-vault' -> 'My Vault').

    The dashboard skill writes the real one (settings.json kb.name), since it
    can restore what a folder name shortens ('base-conhecimento' -> 'Base de
    Conhecimento').
    """
    s = re.sub(r"([a-z])([A-Z])", r"\1 \2", nfc(name))
    words = [w for w in re.split(r"[\s_\-.]+", s) if w]
    out = []
    for i, w in enumerate(words):
        if any(ch.isupper() for ch in w):
            out.append(w)
        elif i and w.lower() in SMALL_WORDS:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out) or name


def short_label(v) -> str:
    """A paper name for a tooltip: a path becomes its file name without extension."""
    s = str(v).strip()
    if "/" in s or "\\" in s:
        s = re.split(r"[\\/]", s)[-1]
    return re.sub(r"\.[A-Za-z0-9]{1,5}$", "", s)


def first_number(v) -> float | None:
    if v is None:
        return None
    m = NUM_RE.search(str(v))
    return float(m.group(1).replace(",", ".")) if m else None


# ---------------------------------------------------------------- reading the KB

def kb_guide(kb: Path) -> dict:
    fm = frontmatter(read(kb / "KB_GUIDE.md"))
    return {
        "mode": fm.get("mode") or "research",
        "topic": fm.get("topic") or kb.name,
        "language": fm.get("language") or "",
        "created": fm.get("created") or "",
    }


def obsidian_vault(kb: Path) -> dict:
    """The Obsidian vault the KB lives in (the nearest folder with .obsidian/)."""
    for root in [kb, *list(kb.parents)[:3]]:
        if (root / ".obsidian").is_dir():
            prefix = "" if root == kb else nfc(kb.relative_to(root).as_posix()) + "/"
            return {"name": nfc(root.name), "prefix": prefix}
    return {}


def sources_manifest(kb: Path, raw_files: dict):
    """Rows of wiki/sources.md, matched to raw/ files whatever the table looks like."""
    text = read(kb / "wiki" / "sources.md")
    rows, unmatched = {}, 0
    for table in md_tables(text):
        for cells in table[1:]:
            # The path column is the one whose pieces are raw/ files; a cell may
            # list several files, and names may contain commas themselves, so
            # the whole cell is tried first and pieces only count when real.
            best: list = []
            for i, c in enumerate(cells):
                whole = clean_cell(c)
                if key(whole) in raw_files:
                    hits = [whole]
                else:
                    pieces = [clean_cell(x) for x in re.split(r",\s+|<br\s*/?>|;\s+", c)]
                    hits = [x for x in pieces if x and key(x) in raw_files]
                    if hits:
                        # Later pieces may be bare names or globs relative to the
                        # first file's folder (a row shared by sibling files).
                        base = hits[0].rsplit("/", 1)[0] + "/" if "/" in hits[0] else ""
                        kbase, seen = key(base), {key(h) for h in hits}
                        for x in pieces:
                            if not x or key(x) in seen:
                                continue
                            if key(base + x) in raw_files:
                                hits.append(base + x)
                                seen.add(key(base + x))
                            elif "*" in x:
                                # A glob only reaches inside the first file's folder,
                                # and a bare "*.pdf" stays at that level (fnmatch's "*"
                                # would otherwise cross every "/").
                                for k, f in raw_files.items():
                                    if k in seen or not k.startswith(kbase + "/" if kbase else "") or not matches(f["path"], [base + x]):
                                        continue
                                    if "/" not in x and "/" in k[len(kbase) + 1 if kbase else 0:]:
                                        continue
                                    hits.append(f["path"])
                                    seen.add(k)
                if len(hits) > len(best):
                    best = hits
                elif (not best and i == 0 and "/" in whole and "*" not in whole
                      and re.search(r"\.[A-Za-z0-9]{1,5}$", whole)
                      and not re.match(r"^(notes|wiki|outputs)/", whole, re.I)
                      and not re.search(r"(^|/)\.", whole)):
                    best = [whole]  # the first column names a file that is gone
            if not best:
                if any(c.strip() for c in cells):
                    unmatched += 1  # glob rows, rows about notes/, files we can't place
                continue
            compiled = compiled_value(cells)
            for path in best:
                rows[key(path)] = {"path": path, "compiled": compiled}
    return rows, unmatched


def parse_plan(path: Path) -> dict | None:
    """Day headings '### YYYY-MM-DD …' with '- [ ]' tasks (study-plan's format)."""
    text = read(path)
    if not text:
        return None
    fm = frontmatter(text)
    days, cur = [], None
    for line in text.splitlines():
        h = DAY_HEADING_RE.match(line)
        if h:
            cur = {"date": h.group(1), "label": h.group(2).strip(" ·-"), "tasks": []}
            days.append(cur)
            continue
        if line.startswith("#"):
            cur = None
            continue
        c = CHECK_RE.match(line)
        if c and cur is not None:
            cur["tasks"].append({"done": c.group(1).lower() == "x", "text": c.group(2).strip()})
    days = [d for d in days if d["tasks"]]
    exams = []
    for e in fm.get("exams") or []:
        if isinstance(e, dict):
            for name, v in e.items():
                d = DATE_RE.search(v or "")
                t = re.search(r"\b(\d{1,2}:\d{2})\b", v or "")
                exams.append({"label": name, "date": d.group(1) if d else "", "time": t.group(1) if t else ""})
    courses = fm.get("courses") or []
    if isinstance(courses, str):
        courses = [courses]
    title = str(fm.get("title") or "").strip() or nfc(path.stem)
    return {"days": days, "exams": exams, "courses": courses, "title": title,
            "version": str(fm.get("version", "")), "updated": str(fm.get("updated", ""))}


def collect(kb: Path, settings: dict) -> dict:
    """Everything that is counted from files. Deterministic."""
    raw_root = kb / "raw"
    exclude = (settings.get("raw") or {}).get("exclude") or []
    raw_all = {}
    for p in walk(raw_root):
        r = rel(p, raw_root)
        if key(r) == "readme.md":
            continue
        raw_all[key(r)] = {"path": r, "ext": p.suffix.lower().lstrip(".") or "—", "mtime": mtime_date(p),
                           "mtime_min": mtime_minute(p)}

    # A file with a manifest row was compiled on purpose, so an exclusion never
    # hides it: exclusions only drop files nobody compiled.
    manifest, unmatched_rows = sources_manifest(kb, raw_all)
    sources = []
    for k, f in raw_all.items():
        row = manifest.get(k)
        if not row and matches(f["path"], exclude):
            continue
        if row and up_to_date(f["mtime_min"], row["compiled"]):
            state = "compiled"
        elif row:
            state = "changed"
        else:
            state = "pending"
        sources.append({**f, "state": state})
    removed = [r["path"] for k, r in manifest.items() if k not in raw_all]
    last_compile = max((r["compiled"] for r in manifest.values() if r["compiled"]), default="")

    wiki_root = kb / "wiki"
    articles, names = [], set()
    for p in walk(wiki_root):
        if p.suffix.lower() != ".md" or p.name.lower() in WIKI_SPECIAL:
            continue
        articles.append({"path": rel(p, wiki_root), "name": nfc(p.stem), "mtime": mtime_date(p)})
        names.add(key(p.stem))
    index_links = {key(Path(t.strip()).name) for t in WIKILINK_RE.findall(read(wiki_root / "index.md"))}
    broken, broken_in = Counter(), defaultdict(set)
    for a in articles:
        for t in WIKILINK_RE.findall(read(wiki_root / a["path"])):
            tk = key(Path(t.strip()).name)
            tk = tk[:-3] if tk.endswith(".md") else tk
            if tk and tk not in names and tk not in {"index", "sources", "readme"}:
                broken[t.strip()] += 1
                broken_in[t.strip()].add(a["name"])
    not_in_index = [a["name"] for a in articles if key(a["name"]) not in index_links] \
        if (wiki_root / "index.md").exists() else []

    notes = []
    if (kb / "notes").exists():
        for p in sorted((kb / "notes").glob("*.md")):
            if p.name.lower() != "readme.md" and (frontmatter(read(p)).get("status") or "") != "compiled":
                notes.append({"path": rel(p, kb / "notes"), "mtime": mtime_date(p)})

    out_root = kb / "outputs"
    out_files, docs = [], []
    for p in walk(out_root):
        r = rel(p, out_root)
        ext = p.suffix.lower().lstrip(".")
        entry = {"path": r, "ext": ext, "mtime": mtime_date(p)}
        if ext == "md" and p.name.lower() != "readme.md":
            fm = frontmatter(read(p))
            if fm.get("type"):
                entry["type"] = str(fm["type"])
                entry["fm"] = fm
                docs.append(entry)
        out_files.append(entry)

    return {
        "raw_all": raw_all, "sources": sources, "manifest": manifest, "unmatched_rows": unmatched_rows,
        "removed": removed, "last_compile": last_compile, "articles": articles,
        "broken": [{"target": t, "count": n, "in": sorted(broken_in[t])[:5]} for t, n in broken.most_common()],
        "not_in_index": not_in_index, "notes": notes, "out_files": out_files, "docs": docs,
    }


# ---------------------------------------------------------------- scan (for the skill)

def depth_tree(files, depth: int = 5):
    agg = defaultdict(lambda: {"files": 0, "ext": Counter(), "newest": ""})
    for f in files:
        parts = f["path"].split("/")[:-1]
        for d in range(0, min(depth, len(parts)) + 1):
            a = agg["/".join(parts[:d]) or "."]
            a["files"] += 1
            a["ext"][f["ext"]] += 1
            a["newest"] = max(a["newest"], f["mtime"])
    return [{"dir": k, "files": v["files"], "ext": dict(v["ext"].most_common(6)), "newest": v["newest"]}
            for k, v in sorted(agg.items())]


def pending_by_folder(sources) -> list:
    """Pending/changed files per folder, at every level down to four, in path order."""
    groups = defaultdict(list)
    for s in sources:
        if s["state"] == "compiled":
            continue
        parts = s["path"].split("/")[:-1]
        for d in range(1, min(4, len(parts)) + 1):
            groups["/".join(parts[:d])].append(s["path"].rsplit("/", 1)[-1])
        if not parts:
            groups["."].append(s["path"])
    return [{"folder": f, "files": len(v), "examples": v[:3]} for f, v in sorted(groups.items())][:200]


def cmd_scan(kb: Path) -> dict:
    settings = load_settings(kb)
    c = collect(kb, settings)
    wiki_dirs = Counter()
    for a in c["articles"]:
        parts = a["path"].split("/")[:-1]
        for d in range(1, len(parts) + 1):
            wiki_dirs["/".join(parts[:d])] += 1
    plans = []
    for f in c["out_files"]:
        if f["ext"] == "md":
            p = parse_plan(kb / "outputs" / f["path"])
            if p and p["days"]:
                tasks = [t for d in p["days"] for t in d["tasks"]]
                plans.append({"path": "outputs/" + f["path"], "title": p["title"], "courses": p["courses"],
                              "exams": p["exams"], "first_day": p["days"][0]["date"],
                              "last_day": p["days"][-1]["date"], "tasks": len(tasks),
                              "done": sum(t["done"] for t in tasks)})
    data_dir = kb / DASH / "data"
    return {
        "kb": kb_guide(kb),
        "today": dt.date.today().isoformat(),
        "installed": (kb / DASH / "app.js").exists(),
        "settings": settings,
        "course_files": sorted(rel(p, data_dir) for p in data_dir.glob("courses/*/*.json")) if data_dir.exists() else [],
        "raw": {
            "exists": (kb / "raw").exists(),
            "files_total": len(c["raw_all"]),
            "files_in_scope": len(c["sources"]),
            "states": dict(Counter(s["state"] for s in c["sources"])),
            "manifest_rows": len(c["manifest"]),
            "manifest_rows_unmatched": c["unmatched_rows"],
            "removed_from_raw": c["removed"][:20],
            "last_compile": c["last_compile"],
            "tree": [t for t in depth_tree(c["raw_all"].values()) if t["dir"].count("/") < 2 or t["files"] >= 3][:250],
            "pending_by_folder": pending_by_folder(c["sources"]),
        },
        "wiki": {"articles": len(c["articles"]), "folders": dict(sorted(wiki_dirs.items())),
                 "broken_links": len(c["broken"]), "not_in_index": len(c["not_in_index"])},
        "notes_pending": len(c["notes"]),
        "outputs": {
            "files": len(c["out_files"]),
            "docs_by_type": dict(Counter(d["type"] for d in c["docs"]).most_common()),
            "docs": [{"path": d["path"], "type": d["type"], "mtime": d["mtime"]} for d in c["docs"]][:200],
            "registry": outputs_registry(kb),
        },
        "plans": plans,
    }


# ---------------------------------------------------------------- build

def load_settings(kb: Path) -> dict:
    return read_json(kb / DASH / "data" / "settings.json", {}) or {}


def outputs_registry(kb: Path) -> list:
    """Purpose folders of outputs/ and what each holds, as outputs/README.md (or KB_GUIDE.md) lists them.

    Either a two-column 'Folder | What goes in it' table, or an annotated tree
    in a code block ('├── estudo/   study material…').
    """
    for name in ("outputs/README.md", "KB_GUIDE.md"):
        text = read(kb / name)
        for table in md_tables(text):
            head = [h.lower() for h in table[0]]
            if len(head) == 2 and not any("date" in h or "data" == h for h in head):
                rows = [{"folder": clean_cell(r[0]).strip("/"), "what": r[1]} for r in table[1:] if r and r[0]]
                if rows:
                    return rows
        tree = []
        for line in text.splitlines():
            m = re.match(r"^[\s│├└─|`-]*([^\s/│├└─][^/]*?)/\s{2,}(\S.*)$", line)
            if m and not m.group(1).startswith(("<", "*")):
                tree.append({"folder": m.group(1).strip(), "what": m.group(2).strip()})
        if tree:
            return tree
    return []


def course_data(kb: Path, area: dict) -> dict:
    d = kb / DASH / "data" / "courses" / (area.get("slug") or slug(area["name"]))
    out = {}
    for name in ("course", "exam-map", "progress"):
        v = read_json(d / f"{name}.json")
        if v is not None:
            out[name.replace("-", "_")] = v
    return out


def area_view(area: dict, c: dict, plans: list, kb: Path) -> dict:
    raw_p, wiki_p, out_p = area.get("raw") or [], area.get("wiki") or [], area.get("outputs") or []
    names = {key(n) for n in [area["name"]] + list(area.get("aliases") or [])}
    srcs = [s for s in c["sources"] if raw_p and under(s["path"], raw_p)]
    st = Counter(s["state"] for s in srcs)
    arts = [a for a in c["articles"] if wiki_p and under(a["path"], wiki_p)]
    files = [f for f in c["out_files"] if out_p and under(f["path"], out_p)]
    docs = [d for d in c["docs"] if out_p and under(d["path"], out_p)]
    cd = course_data(kb, area)

    # Grades: the progress file when a skill wrote one, else the assessments' frontmatter.
    course = cd.get("course") or {}
    course_scale = first_number(course.get("grade_scale")) or 20
    attempts = (cd.get("progress") or {}).get("attempts")
    if not attempts:
        attempts = []
        for d in sorted((d for d in docs if d["type"] == "assessment"),
                        key=lambda d: str(d["fm"].get("attempt_date") or d["fm"].get("date") or d["mtime"])):
            g = first_number(d["fm"].get("estimated_grade"))
            if g is None:
                continue
            a = {"date": str(d["fm"].get("attempt_date") or d["fm"].get("date") or d["mtime"]),
                 "paper": short_label(d["fm"].get("paper") or Path(d["path"]).stem), "grade": g}
            # A grade on another scale (e.g. a practical part out of 12) is put on
            # the course's scale and flagged, so the trend doesn't show a false drop.
            sc = first_number(d["fm"].get("scale"))
            if sc and abs(sc - course_scale) > 1e-9:
                a.update(grade=round(g * course_scale / sc, 1), raw=f"{g:g}/{sc:g}", partial=True)
            note = d["fm"].get("estimated_grade_note")
            if note:
                a["note"] = str(note)
            attempts.append(a)

    exams = list(course.get("exams") or [])
    if not exams:
        for p in plans:
            exams += [dict(e, source="plan:" + p["path"]) for e in p["exams"] if key(e["label"]) in names]

    materials = []
    for d in docs:
        if d["type"] in BOOKKEEPING:
            continue
        materials.append({"path": "outputs/" + d["path"], "type": d["type"],
                          "title": str(d["fm"].get("title") or "") or Path(d["path"]).stem,
                          "version": str(d["fm"].get("version") or ""), "updated": str(d["fm"].get("updated") or d["mtime"])})
    return {
        "slug": area.get("slug") or slug(area["name"]),
        "name": area["name"], "aliases": area.get("aliases") or [], "archived": bool(area.get("archived")),
        "raw": raw_p, "wiki": wiki_p, "outputs": out_p,
        "sources": {"total": len(srcs), "compiled": st["compiled"], "pending": st["pending"], "changed": st["changed"]},
        "pending": sorted(({"path": s["path"], "state": s["state"], "mtime": s["mtime"]} for s in srcs if s["state"] != "compiled"),
                          key=lambda s: s["mtime"], reverse=True)[:40],
        "articles": [{"path": a["path"], "name": a["name"], "mtime": a["mtime"]} for a in arts],
        "materials": materials,
        "outputs_count": len(files),
        "attempts": attempts,
        "quizzes": (cd.get("progress") or {}).get("quizzes", sum(1 for d in docs if d["type"] == "quiz")),
        "course": course,
        "exam_map": cd.get("exam_map") or {},
        "progress": {k: v for k, v in (cd.get("progress") or {}).items() if k != "attempts"},
        "exams": exams,
    }


def events(kb: Path, limit: int = 400) -> list:
    out = []
    d = kb / DASH / "data" / "activity"
    if d.exists():
        for p in sorted(d.glob("*.json"), reverse=True)[:limit]:
            e = read_json(p)
            if isinstance(e, dict) and e.get("date"):
                out.append(e)
    return out


def heat(c: dict, evs: list, days: int = 182) -> dict:
    since = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    h = Counter()
    for e in evs:
        if e["date"] >= since:
            h[e["date"]] += 2
    for a in c["articles"]:
        if a["mtime"] >= since:
            h[a["mtime"]] += 1
    for f in c["out_files"]:
        if f["mtime"] >= since and f["ext"] not in HEAT_SKIP_EXTS:
            h[f["mtime"]] += 1
    for n in c["notes"]:
        if n["mtime"] >= since:
            h[n["mtime"]] += 1
    return dict(sorted(h.items()))


def recent_files(c: dict, days: int = 21) -> list:
    since = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    ev = [{"date": s["mtime"], "kind": "raw", "path": s["path"]} for s in c["sources"] if s["mtime"] >= since]
    ev += [{"date": a["mtime"], "kind": "wiki", "path": a["path"]} for a in c["articles"] if a["mtime"] >= since]
    ev += [{"date": n["mtime"], "kind": "note", "path": n["path"]} for n in c["notes"] if n["mtime"] >= since]
    ev += [{"date": f["mtime"], "kind": "output", "path": f["path"]} for f in c["out_files"]
           if f["mtime"] >= since and f["ext"] in OUTPUT_EXTS]
    ev.sort(key=lambda e: (e["date"], e["kind"], e["path"]), reverse=True)
    return ev[:120]


def cmd_build(kb: Path) -> Path:
    settings = load_settings(kb)
    if not settings:
        sys.exit(f"{kb / DASH / 'data' / 'settings.json'} is missing — run the dashboard skill first.")
    guide = kb_guide(kb)
    c = collect(kb, settings)

    plans = []
    for p in settings.get("plans") or []:
        parsed = parse_plan(kb / p["path"]) if p.get("path") else None
        if parsed:
            plans.append({"label": p.get("label") or parsed["title"], "path": p["path"], **parsed})
    areas = [area_view(a, c, plans, kb) for a in settings.get("areas") or []]

    st = Counter(s["state"] for s in c["sources"])
    pend = sorted((s for s in c["sources"] if s["state"] != "compiled"), key=lambda s: s["mtime"], reverse=True)
    evs = events(kb)
    reg = outputs_registry(kb)
    data = {
        "version": 2,
        "generated": dt.datetime.now().isoformat(timespec="minutes"),
        "kb": {**guide, "folder": nfc(kb.name), "name": folder_title(kb.name),
               **{k: v for k, v in (settings.get("kb") or {}).items() if v}},
        "vault": obsidian_vault(kb),
        "language": settings.get("language") or guide["language"] or "en",
        "theme": settings.get("theme") or "dark",
        "raw": {"exclude": (settings.get("raw") or {}).get("exclude") or [], "why": (settings.get("raw") or {}).get("why", ""),
                # raw/ is often a junction, which browsers won't follow: the page
                # asks for this real folder instead when counting live.
                "target": nfc(os.path.realpath(kb / "raw")) if (kb / "raw").exists() else "",
                "is_link": (kb / "raw").exists() and nfc(os.path.realpath(kb / "raw")) != nfc(str((kb / "raw").absolute()))},
        # For the live count in the browser: every compiled raw/ path and its
        # "last compiled" value (YYYY-MM-DDTHH:MM, or a bare date in old rows).
        "compiled": {k: [r["compiled"], r["path"]] for k, r in c["manifest"].items()},
        "totals": {
            "raw_files": len(c["raw_all"]), "sources": len(c["sources"]), "compiled": st["compiled"],
            "pending": st["pending"], "changed": st["changed"], "excluded": len(c["raw_all"]) - len(c["sources"]),
            "removed": len(c["removed"]), "articles": len(c["articles"]), "broken_links": len(c["broken"]),
            "not_in_index": len(c["not_in_index"]), "notes_pending": len(c["notes"]),
            "outputs": len(c["out_files"]), "last_compile": c["last_compile"],
        },
        "pending": [{"path": s["path"], "state": s["state"], "mtime": s["mtime"]} for s in pend[:40]],
        "removed": c["removed"][:20],
        "broken": c["broken"][:20],
        "not_in_index": c["not_in_index"][:20],
        "notes": c["notes"][:20],
        "articles": [{"path": a["path"], "name": a["name"]} for a in c["articles"]],
        "outputs": {
            "registry": reg,
            "files": [{k: v for k, v in f.items() if k != "fm"} | (
                {"title": str(f["fm"].get("title") or ""), "version": str(f["fm"].get("version") or ""),
                 "status": str(f["fm"].get("status") or "")} if "fm" in f else {})
                for f in c["out_files"] if f["ext"] in OUTPUT_EXTS and Path(f["path"]).name.lower() != "readme.md"][:600],
        },
        "areas": areas,
        "plans": plans,
        "events": evs[:150],
        "recent": recent_files(c),
        "heat": heat(c, evs),
        "missing": read_json(kb / DASH / "data" / "missing.json", []) or [],
        "extra": settings.get("extra") or [],
    }
    out = kb / DASH / "data.js"
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    tmp = out.with_name(f"{out.name}.{os.getpid()}.tmp")
    tmp.write_text("window.KB_DASHBOARD = " + payload + ";\n", encoding="utf-8")
    os.replace(tmp, out)  # the page never reads a half-written file
    return out


# ---------------------------------------------------------------- install, event

def cmd_install(kb: Path) -> list:
    """Copy the page and this script into the KB. Data files are never touched."""
    dash = kb / DASH
    (dash / "data" / "activity").mkdir(parents=True, exist_ok=True)
    (dash / "data" / "courses").mkdir(parents=True, exist_ok=True)
    done = []
    for name in ("app.js", "app.css"):
        shutil.copyfile(APP_SRC / name, dash / name)
        done.append(f"{DASH}/{name}")
    if Path(__file__).resolve() != (dash / "dashboard.py").resolve():
        shutil.copyfile(Path(__file__).resolve(), dash / "dashboard.py")
        done.append(f"{DASH}/dashboard.py")
    shutil.copyfile(APP_SRC / "dashboard.html", kb / PAGE)
    done.append(PAGE)
    return done


def cmd_event(kb: Path, args: list) -> Path:
    if len(args) < 2:
        sys.exit('usage: dashboard.py event SKILL "summary" [--area A] [--count N] [--data JSON]')
    settings = load_settings(kb)
    if not settings:
        sys.exit(f"{kb / DASH / 'data' / 'settings.json'} is missing — run the dashboard skill first; nothing was logged.")
    skill, summary, rest = args[0], args[1], args[2:]
    now = dt.datetime.now()
    e = {"date": now.date().isoformat(), "time": now.strftime("%H:%M"), "skill": skill, "summary": summary}
    i = 0
    while i < len(rest):
        flag, val = rest[i], rest[i + 1] if i + 1 < len(rest) else None
        if flag == "--area" and val:
            known = {key(n) for a in settings.get("areas") or [] for n in [a.get("name", "")] + list(a.get("aliases") or [])}
            if key(val) not in known:
                print(f"warning: area '{val}' is not in settings.json; the event is logged without a course page", file=sys.stderr)
            e["area"] = val
        elif flag == "--count" and val:
            e["count"] = int(first_number(val) or 0)
        elif flag == "--data" and val:
            try:
                e["data"] = json.loads(val)
            except json.JSONDecodeError as err:
                sys.exit(f"--data is not valid JSON: {err}")
        else:
            sys.exit(f"unknown option {flag}")
        i += 2
    # A random suffix keeps two events of the same skill in the same second apart.
    folder = kb / DASH / "data" / "activity"
    folder.mkdir(parents=True, exist_ok=True)
    tmp = folder / f".event.{os.getpid()}.{uuid.uuid4().hex}.tmp"
    tmp.write_text(json.dumps(e, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    try:
        for _ in range(20):
            target = folder / f"{now.strftime('%Y-%m-%dT%H-%M-%S')}-{slug(skill)}-{uuid.uuid4().hex[:6]}.json"
            try:
                os.link(tmp, target)  # atomic, and fails if the name is taken: never overwrites
                return target
            except FileExistsError:
                continue
        sys.exit("could not find a free event file name")
    finally:
        tmp.unlink(missing_ok=True)


# ---------------------------------------------------------------- main

def resolve_kb(arg: str | None) -> Path:
    if arg:
        return Path(arg).resolve()
    if HERE.name == DASH:
        return HERE.parent
    return Path.cwd().resolve()


def main(argv) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if len(argv) < 2 or argv[1] not in ("scan", "build", "install", "event"):
        print(__doc__)
        return 2
    cmd = argv[1]
    if cmd == "event":
        kb = resolve_kb(None)
        f = cmd_event(kb, argv[2:])
        cmd_build(kb)
        print(f)
        return 0
    kb = resolve_kb(argv[2] if len(argv) > 2 else None)
    if not (kb / "KB_GUIDE.md").exists() and not (kb / "wiki").exists():
        print(f"{kb} doesn't look like a knowledge base (no KB_GUIDE.md or wiki/)", file=sys.stderr)
        return 1
    if cmd == "scan":
        print(json.dumps(cmd_scan(kb), ensure_ascii=False, indent=1))
    elif cmd == "install":
        print("\n".join(cmd_install(kb)))
    else:
        print(cmd_build(kb))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
