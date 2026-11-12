---
name: dashboard
description: Set up or update the dashboard of a research knowledge base created by the knowledge-base skill — dashboard.html at the KB root, opened with a double click, offline, in the Syntraq look, with menus: an overview (next exams, next steps with requests to copy into Claude, today's tasks, study rhythm, what's missing), one page per course (exam countdowns, priorities, estimated grades with trend and pass mark, plan, material, sources, wiki), sources (compiled vs pending, counted live from raw/ when the browser is connected), wiki health, outputs and activity. Other skills keep it current by logging what they do; this skill is only needed the first time, after a plugin update, or when new folders or courses appear. It decides what the KB's folders mean without asking questions. Use when the user wants a dashboard or wants it set up, updated, repaired or extended — e.g. "faz o dashboard da KB", "atualiza o dashboard", "adiciona a nova UC ao dashboard", "show me the dashboard", "set up the KB dashboard".
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(python *), Bash(py *)
---

# Dashboard

A dashboard that stays current on its own. The parts and who keeps each one up to date:

| Part | Where | Kept by |
| --- | --- | --- |
| The page | `dashboard.html` at the KB root (a few lines) | this skill (`install`) |
| The app | `.dashboard/app.js`, `.dashboard/app.css` | this skill (`install`), copied from the plugin |
| The builder | `.dashboard/dashboard.py`, the plugin's `scripts/dashboard.py` copied into the KB | this skill (`install`) |
| What things mean | `.dashboard/data/settings.json`: areas, exclusions, plans, the KB's name, the theme | this skill; the page saves the theme |
| Course facts | `.dashboard/data/courses/<slug>/course.json`, `exam-map.json`, `progress.json` | the study skills (see the study plugin's `references/dashboard.md`); this skill fills gaps |
| What happened | `.dashboard/data/activity/*.json`, one small file per event | every skill, through `dashboard.py event` |
| The snapshot the page reads | `.dashboard/data.js` | `dashboard.py build`, run by every `event` |

Every count (sources compiled and pending, articles, broken links, the notes inbox, outputs, plan ticks, grades from assessments) is made by `dashboard.py` from the files themselves. No skill writes a count. When the browser is connected to the KB folder (a button on the page, Chrome or Edge), the page also counts `raw/` live on every open, so new material shows up without anything being run.

`.dashboard/` starts with a dot so Obsidian ignores it. Only `dashboard.html` sits at the root.

`<plugin>` below is this plugin's folder: the two levels above this skill's directory.

## When this skill is needed

- **The first time**, to set it up.
- **After the plugin was updated**, to copy the new app and builder (`install` again; data is never touched).
- **When the scan shows something `settings.json` doesn't cover**: a new `raw/` or `wiki/` folder (a new course, a new project), a new kind of output, a new plan.
- **When the user asks** for a change: an exam date, a pass mark, an area renamed or archived.

Everything else updates itself. If the user asks to "update the dashboard" and nothing is new, run `python .dashboard/dashboard.py build` (no event: nothing happened), say the numbers are current, and stop.

## Rules

- **Never ask the user anything.** Decide from what the KB shows, write it down, and list the decisions in the report so the user can correct them. Anything that can't be found becomes a missing card with a request the user can copy. Never guess.
- **Write only inside `.dashboard/` and `dashboard.html`.** Nothing in `raw/`, `wiki/`, `notes/` or `outputs/` is touched, and nothing is registered in `outputs/README.md`.
- **Research KBs only.** If `KB_GUIDE.md` says `mode: code`, say the dashboard covers research knowledge bases only, and stop.
- **The user's values win.** Keep anything with `"source": "user"`, the theme, and anything the user edited by hand. Re-decide only what is new.
- **Write in the KB's language** (`language:` in `KB_GUIDE.md`): names, missing cards, `why` lines. The page translates its own labels for Portuguese and English.

## Steps

1. **Find the knowledge base**, the same way `compile-wiki` does: the folder with `KB_GUIDE.md` and `wiki/`. Read `KB_GUIDE.md`'s frontmatter (`mode`, `topic`, `language`).

2. **Install or update the app**: `python <plugin>/scripts/dashboard.py install <kb>`. If `python` isn't found, try `py`. This copies `app.js`, `app.css`, `dashboard.py` and `dashboard.html`, and creates the data folders. It never touches `.dashboard/data/`.

3. **Scan**: `python <plugin>/scripts/dashboard.py scan <kb>`. The JSON it prints has:
   - the current `settings`, and which course files already exist;
   - `raw`: totals, states (`compiled` / `changed` / `pending`), manifest rows it couldn't match, files gone from `raw/`, the last compile date, a folder tree with counts and extensions, and the pending files grouped by folder;
   - `wiki`: articles, the folders that hold them, broken links, articles missing from `index.md`;
   - `notes_pending`, and `outputs`: docs by `type` and the purpose-folder registry of `outputs/README.md`;
   - `plans`: every output written as a day-by-day plan (dated `###` headings with `- [ ]` tasks), whatever its `type`.

   If `settings.json` already covers everything the scan shows (no new folder outside every area and exclusion, no new progress record, exams article or plan) **and** no course file step 7 would seed is missing (a studied course with an exams article but no `exam-map.json`, or a progress record but no `progress.json`), only run `python .dashboard/dashboard.py build`, report, and stop. Don't log an event for a run that changed nothing.

4. **Name the KB.** `kb.name` is the KB's folder name written as a proper name in the KB's language, shown at the top of the sidebar. Don't just swap dashes for spaces: restore what the name shortens, e.g. `base-conhecimento` becomes `Base de Conhecimento` and `kb_estudo` becomes `KB de Estudo`. `kb.title` is the overview's heading: `topic:` from `KB_GUIDE.md`, shortened to how the KB itself refers to it (an acronym it uses, for example). Put the full `topic:` in `kb.subtitle` when the title shortens it.

5. **Decide the scope of `raw/`.** Code that sits in `raw/` (a cloned repo, a project, build output) is reference, not a source (`compile-wiki`'s rule), so without an exclusion it would always look pending.
   - **Reference:** a whole project, recognised by a build file (`pom.xml`, `package.json`, `*.csproj`), a `target/`, `build/`, `bin/` or `node_modules/` folder, and mostly `.java`/`.class`/`.xml`/`.json` files.
   - **Material:** a course's own exercise files (`.pl`, `.py` or `.drl` solutions to class sheets, worked examples), **even when they sit in a folder called `code/`**. When the two readings clash, material wins: a folder name never decides alone.
   - **A project that holds material** (e.g. a Maven project whose `src/` has a course's exam solutions): exclude only its build output and tooling (`target/**`, `build/**`, `mvnw*`, the build file), not the project.
   - **Already compiled:** a file with a row in `wiki/sources.md` always counts, whatever the exclusions say. The script and the page both enforce this.

   Write `raw.exclude` patterns (`"Some/Folder/**"`, `"**/*.class"`) and a one-line `raw.why`. Re-run `scan` and check that `pending_by_folder` now holds only real material.

6. **Decide the areas.** An area is what the KB groups by: a course (UC), a project, a topic. Each one gets its own page on the dashboard.
   - Take the folder level that names one course, project or topic. Under archive nesting (`Arquivo/<year>/<semester>/<course>`), take the course folder, not its ancestors. A shared folder such as `geral/` or `general/` is not an area.
   - Add an area for material in `raw/` that has no wiki folder yet (a new semester's courses), so its pending sources show up. Give it the `wiki` and `outputs` prefixes it will have, following where the KB puts its current courses (`KB_GUIDE.md`'s layout, or the level the other areas use, e.g. `PLNTDIA` while older courses sit under `Arquivo/…`). A prefix that doesn't exist yet is fine: it starts counting when the folder appears.
   - For each area, write `name`, `slug` (lower-case ASCII, e.g. `engcia`; it names its folder under `courses/`, so never change it once set), `aliases` (an acronym, the full name, the plan's label), and the folder prefixes `wiki`, `raw` and `outputs` (relative to `wiki/`, `raw/`, `outputs/`; they may overlap).
   - Set `archived: true` when the area sits under an archive folder or its exams are long past. Archived areas get a collapsed "Archive" group in the menu.

7. **Fill the course facts the study skills haven't written yet.** The study skills keep `courses/<slug>/*.json` current from now on (the study plugin's `references/dashboard.md` has the format). This step only seeds what's missing, for every course that has study files: an exams article, a progress record, assessments or a plan that names it. Archived courses included, since their history still shows on their page.
   - **`exam-map.json`**: when the course has an exams article (written by `exam-map`) but no file yet, write it from the article's ranking, one row per line, following the study plugin's `references/dashboard.md` for `name`, `article`, `band` and `share`.
   - **`progress.json`**: when the course has a progress record (type `progress`) but no file yet, write `topics`, `quizzes` and `updated` from it, as that reference describes. Leave `attempts` out: the builder reads the grades from the assessments (and puts a grade on another scale, such as a practical part out of 12, on the course's scale, marked as partial).
   - **`course.json`**: write the exam dates and the pass mark.
     - **Exam dates**: a study plan's `exams:` frontmatter is read by the builder when the plan is listed in `plans`, matched by name or alias. Otherwise search the KB (the exams article, the course's notes, a calendar or course outline in `raw/`) and write `exams: [{"label", "date", "time", "source"}]`, leaving out `time` when it isn't known.
     - **Dates without a year, and which year a document is from**, follow the study plugin's `references/dashboard.md` ("Exam dates").
     - **`pass_grade`**, `pass_rules` and `grade_scale` follow that reference too ("Pass mark"). It isn't always 9.5, and a minimum on one component is not the course's pass mark.
     - When a date or pass mark can't be found, write nothing. The page shows a missing card with a request the user can copy (e.g. "a data do exame de X é …").
   - To read PDFs in `raw/`, use Python (`pymupdf`/`fitz` or `pypdf`, whichever is installed) with `PYTHONIOENCODING=utf-8` set (the Windows console can't print accented text otherwise), and find files with a glob from Python. Names on disk may be Unicode-decomposed, so a path typed into Read can fail even though the file exists.

8. **Plans and extras.**
   - `plans`: list the study plans from the scan whose last day is no more than 14 days before today as `{"path": "outputs/…/plan.md", "label": "<its title>"}`. Team or project plans that aren't for studying stay out. `study-plan` adds new ones itself from now on.
   - `extra`: generic panels for something the KB has that the pages don't cover (a dataset, a reading list, a project with deliverables). Kinds: `{"title", "kind": "stat", "value", "sub"}`, `{"title", "kind": "progress", "value", "total"}`, `{"title", "kind": "list", "items": [...]}`, `{"title", "kind": "table", "columns": [...], "rows": [[...]]}`, each with an optional `note` (give hand-written numbers a dated note). Never add a panel just to fill space.
   - `missing.json` (a list of `{"area", "kind", "what", "how", "prompt"}`) is for gaps the page can't detect by itself. The page already adds two kinds on its own, and skips them when `missing.json` has one of the same `kind` for that area:
     - `exam-date`: a current (not archived) course with no upcoming exam date;
     - `pass-grade`: a course with grades or an upcoming exam but no pass mark.

9. **Write `settings.json`** (format below), then build: `python .dashboard/dashboard.py event dashboard "<one line: what was set up or changed>"`, run from the KB root. That logs the run and builds `data.js`.

10. **Report** in a few lines, in the KB's language:
    - the main numbers: sources compiled out of those in scope, pending, articles, next exam;
    - what you decided on your own: exclusions, areas, dates and pass marks with their sources;
    - the missing cards;
    - how to open it: double-click `dashboard.html`. In Chrome or Edge, "Ligar à pasta da KB" (and, when `raw/` is a link to another folder, "Ligar a pasta do raw/", pointing at the folder the page names) turns on the live count of `raw/` and saves the theme to the file;
    - that from now on the other skills keep it current, and this skill is only needed for new folders, new courses or after a plugin update.

## `settings.json`

```json
{
  "version": 2,
  "kb": { "name": "Base de Conhecimento", "title": "LEI", "subtitle": "Licenciatura em Engenharia Informática" },
  "language": "pt-PT",
  "theme": "dark",
  "raw": { "exclude": ["Arquivo/2025-26/code/projeto-final/**"], "why": "projeto Java de referência, não é material a compilar" },
  "areas": [
    {
      "name": "BD", "slug": "bd", "aliases": ["Bases de Dados"],
      "wiki": ["Arquivo/2025-26/BD"], "raw": ["Arquivo/2025-26/BD"], "outputs": ["Arquivo/2025-26/BD"],
      "archived": true
    }
  ],
  "plans": [{ "path": "outputs/…/plano-epoca-normal.md", "label": "Plano — época normal" }],
  "extra": []
}
```

- `theme` is `dark` (the default) or `light`. The page's toggle rewrites it when the browser is connected to the folder; otherwise the browser remembers the choice by itself.
- Any key the page doesn't know is ignored, so the user can keep notes in the file.

## What the page shows

- **Overview**: the headline numbers, the upcoming exams, next steps, today's plan tasks, the study rhythm (a heat map of days with activity, and the streak), and what's missing.
  - **Next steps** come from simple rules: compile what's pending, train weak topics that weigh a lot when an exam is near, take a mock exam if there was no attempt in a week, map past exams, replan when behind.
  - Each step has a **copy** button with the request to paste into Claude.
- **One page per course**:
  - exam countdowns, with where each date came from;
  - next steps;
  - priorities: weak and heavy topics first, linked to the article in Obsidian;
  - estimated grades, with the trend, a projection of the next attempt and the pass mark line;
  - the plan's tasks for that course, and the material made (each file opens on click);
  - its sources and its wiki articles.
- **Sources**: compiled, changed and pending per area, the newest pending files, files gone from `raw/`, and the live-count control.
- **Wiki**: articles per area, broken links, articles missing from `index.md`, and the notes inbox.
- **Outputs**: every output grouped by area and purpose folder, as `outputs/README.md` registers them, with type filters and a text filter. Each file opens on click.
- **Activity**: the rhythm heat map, what each skill did (from the events), and the files that changed.
- **Search** in the sidebar finds courses, wiki articles (opened in Obsidian) and outputs.

**Without the study plugin** (or in a KB that isn't used to study) the page works the same: with no exams, plans, topics or grades, the study parts simply don't appear, the menu calls the areas "Areas" instead of courses, and no exam-date cards are shown. Each area's page then shows its next steps, sources, wiki articles and outputs.

Countdowns, "today", the plan's ahead/behind state and the streak are worked out in the browser every time the page opens. The page needs nothing else to stay right from one day to the next.
