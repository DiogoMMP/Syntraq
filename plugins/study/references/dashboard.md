# Feeding the dashboard

The knowledge base may have a dashboard: `dashboard.html` at its root and a `.dashboard/` folder set up by the knowledge-base plugin's `dashboard` skill. Its general rules (logging an event, what never to touch) are those of the knowledge-base plugin. This file adds what study skills write: one small JSON file per course, which the page shows on that course's page.

**Only when `.dashboard/dashboard.py` exists.** Otherwise skip all of this and don't mention it.

## Which course

The course's files live in `.dashboard/data/courses/<slug>/`, where `<slug>` is the course's `slug` in `.dashboard/data/settings.json` → `areas`. Find the course there by `name` or `aliases`. A course with no entry in `areas` gets no course files: log the event, and say in the report that "atualiza o dashboard" adds the course to the page.

## The files

Each file is owned by the skills listed, which rewrite it whole from their own records. Read it first and keep any key you don't own. Write valid JSON (UTF-8, `"` quotes, no comments). Dates are `YYYY-MM-DD`.

**`course.json`**, the course's facts:

```json
{
  "grade_scale": 20,
  "pass_grade": 9.5,
  "pass_source": "raw/<course>/Ficha da UC.pdf",
  "pass_rules": "exame ≥ 7,5 e nota final ≥ 9,5",
  "exams": [{ "label": "Época normal", "date": "2027-01-12", "time": "09:30", "source": "outputs/…/plano.md" }]
}
```

- `study-plan` writes the dates it put in the plan into `exams`. It merges them into the list: it replaces only the entries that came from this plan (same `source`) and the sittings it now dates, and keeps the dates other plans or the user wrote.
- `exam-map` writes `grade_scale`, `pass_grade` and `pass_rules` when the course's rules state them (exam headers, the course outline, the teacher's rules). `grade_scale` may also come from the assessments' `scale`.

**Pass mark.** `pass_grade` is the final grade needed to pass the course, on `grade_scale`. On a 0-20 scale it is 9.5 and the page assumes that when the field is missing, so leave it out unless the course's rules state a different final mark. The minimum for the exam alone (e.g. "exame ≥ 7,5") can differ from it and is not the pass mark: put it in `pass_rules`, a short line the page shows next to the pass mark. On any other scale, with no stated rule, leave both out and the page shows no pass mark.

**Exam dates.** Only dates for the current academic year count (September to August).
- A document's year is the one written on it or in its name (`2025-2026`). With none, it's the year of the folder it sits in, else the year its file date falls in.
- A document from an earlier academic year gives no date.
- A date without a year (e.g. "18th January" on a slide) gets the year that date falls in within the document's academic year, with `"inferred": true`, and only when the document is from the current academic year. If weekdays are given, they must agree; if not, give no date. The page marks inferred dates.
- The user may also tell any skill an exam date or a pass mark. Write it here with `"source": "user"`. A value from the user is never replaced by one a skill found or inferred, but a new value the user gives explicitly ("the exam moved to the 20th") replaces it, keeping `"source": "user"`.

**`exam-map.json`** is written by `exam-map`, from the exams article it just wrote:

```json
{ "updated": "2026-11-07", "topics": [{ "name": "Raciocínio com Incerteza — Bayes (LS/LN)", "article": "Raciocínio com Incerteza", "band": "🔥", "share": 15.4 }] }
```

There is one row per line of the article's ranking, so sub-parts stay apart:
- `article` is the wiki article the line links to.
- `name` is what the line says about it: the article's title, plus ` — <sub-part>` when the line names a part of the article (`[[Raciocínio com Incerteza]] — Bayes (LS/LN)` becomes `Raciocínio com Incerteza — Bayes (LS/LN)`). A parenthetical that only describes the whole article stays out (`[[Ontologias]] (Web Semântica…)` becomes `Ontologias`).
- `band` is 🔥, ⚠️ or 📎, and `share` is the average exam weight in %.

**`progress.json`** is written by `correct-attempt` and `quiz`, rebuilt every time the progress record is rebuilt, from the same data:

```json
{
  "updated": "2026-11-06",
  "topics": [{ "article": "Raciocínio com Incerteza", "state": "red", "note": "(1 tentativa)" }],
  "attempts": [{ "date": "2026-10-21", "paper": "Normal 22", "grade": 12.5 }],
  "quizzes": 4
}
```

- `state` is `red`, `yellow`, `green` or `none`, the record's 🔴 🟡 🟢 ⚪.
- `note` is the parenthesis that follows the state in the record's state cell (`🟢 (1 tentativa)` gives `(1 tentativa)`), copied as it is, or `""`.
- `quizzes` is the number of quiz sessions, the record's `quizzes:`.
- `attempts` are the marked attempts, oldest first. `paper` is a short name, never a path. A grade on another scale (a practical part out of 12) goes in on the course's scale, with `"raw": "11/12"` and `"partial": true`.

## Then log the event

After writing (or when the skill made something but writes no course file, e.g. a summary or flashcards), run the knowledge-base event command once from the KB root:

```
python .dashboard/dashboard.py event <skill> "<one line in the KB's language>" --area "<course name>" [--count N]
```

This also rebuilds the page's data. If it fails, say so in one line and carry on.
