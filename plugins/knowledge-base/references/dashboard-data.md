# Feeding the dashboard

A knowledge base may have a dashboard: `dashboard.html` at its root and a `.dashboard/` folder next to it, set up by the `dashboard` skill. Skills keep it current by logging what they did, so the user never has to refresh it by hand.

**Only when `.dashboard/dashboard.py` exists.** If the KB has no `.dashboard/` folder, skip everything here and don't mention the dashboard.

## The one command

At the end of a run that changed something in the KB, run this from the KB root:

```
python .dashboard/dashboard.py event <skill> "<what happened, one line>" [--area "<area>"] [--count N]
```

- `<skill>` is the skill's name (`compile-wiki`, `wiki-lint`, `capture-note`…).
- The summary is one short line in the KB's language, e.g. `Compilou 12 fontes e 2 notas` or `Corrigiu 3 links partidos`.
- `--area` is the area the work was about, using its name as the dashboard knows it (`.dashboard/data/settings.json` → `areas`). Leave it out when the work spans the whole KB.
- `--count` is the main number: sources compiled, links fixed, questions marked.

The command writes one small file to `.dashboard/data/activity/` and rebuilds `.dashboard/data.js`, so the page shows the new numbers the next time it opens. If `python` isn't found, try `py`. If the command fails, say so in one line of the report and carry on: the dashboard must never block a skill's work.

Run it once per run, not once per file. Skip it when nothing changed (a dry run, a report that only reads). If the numbers only need refreshing, `python .dashboard/dashboard.py build` rebuilds without logging anything.

## What not to touch

- `.dashboard/data.js`, `app.js`, `app.css` and `dashboard.py` are generated or copied: never edit them.
- `.dashboard/data/settings.json` belongs to the `dashboard` skill (areas, exclusions, the theme the page saves). The one exception is `study-plan`, which adds its plan to `plans`.
- Counts never go into any file. The script counts `raw/`, the wiki, the notes inbox and `outputs/` by itself on every rebuild.

## When the dashboard needs the `dashboard` skill instead

A new top-level folder in `raw/` or `wiki/` (a new course, a new project), or a new plugin that writes something the page doesn't show yet, is the only case where the page needs re-interpreting. Logging the event is still right. Then add one line to the report: the new folder isn't on the dashboard yet, and saying "atualiza o dashboard" (or "update the dashboard") adds it.
