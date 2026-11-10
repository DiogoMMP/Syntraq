#!/usr/bin/env python3
"""Build the zip of the Word version of a skill, ready to upload at claude.ai/customize/skills.

Copies word/<skill>/ and the shared rules into one folder, then zips it with the folder as the zip's root.

    python word-skills/build_zip.py report-review [--out DIR] [--lowercase]

Each skill lives in word-skills/<skill>/ (outside plugins/, so the marketplace does not pick it up).
The shared rules are copied from plugins/reports/references/, so the zip is always built from the repo's current files.

--lowercase names the skill file skill.md instead of SKILL.md (the upload docs write it lowercase;
use it if the upload says the file is missing).
"""
import argparse
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REFERENCES = HERE.parent / "plugins" / "reports" / "references"
SHARED = ["regras-academicas.md"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("skill")
    ap.add_argument("--out", default=".", help="folder for the zip (default: current folder)")
    ap.add_argument("--lowercase", action="store_true")
    args = ap.parse_args()

    src = HERE / args.skill
    if not (src / "SKILL.md").is_file():
        print(f"Skill not found: {src / 'SKILL.md'}", file=sys.stderr)
        return 1

    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    zip_path = out / f"{args.skill}.zip"

    with tempfile.TemporaryDirectory() as tmp:
        pkg = Path(tmp) / args.skill
        shutil.copytree(src, pkg)
        for name in SHARED:
            shutil.copy2(REFERENCES / name, pkg / name)
        if args.lowercase:
            (pkg / "SKILL.md").rename(pkg / "skill.md")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(pkg.rglob("*")):
                if f.is_file():
                    z.write(f, Path(args.skill) / f.relative_to(pkg))

    with zipfile.ZipFile(zip_path) as z:
        print(f"Built {zip_path}")
        for n in z.namelist():
            print("  ", n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
