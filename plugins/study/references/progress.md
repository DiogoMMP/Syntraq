# Progress record — how it is built

The per-course progress record is shared by `correct-attempt` (exam-style attempts) and `quiz` (chat quiz sessions). Both follow this file, so the record means the same thing whoever updated it last.

## Where it lives

In the KB's study purpose folder (found as `study-folder.md` describes), one folder per course, names in the KB's language:

```
outputs/<area>/<study>/<progress>-<course>/
├── <progress>-<course>.md     the record — rebuilt, never patched by hand
├── <attempts>/NN-<paper>.md    one assessment per marked attempt (correct-attempt)
└── <quizzes>/quiz-NN.md        one file per quiz session (quiz)
```

e.g. `progresso-engcia/progresso-engcia.md`, `progresso-engcia/tentativas/01-simulado-1.md`, `progresso-engcia/quizzes/quiz-03.md`.

## Rebuild, don't patch

Every time an assessment or a quiz session is added, rebuild `<progress>-<course>.md` from scratch out of the frontmatter of every file in `<attempts>/` and `<quizzes>/`, following `skills/correct-attempt/templates/progress.md`. Never edit the record incrementally — rebuilding means it can't drift from the files it summarises. The record isn't rendered to PDF. Keep its single row in the index table of `outputs/README.md` current.

## Writing it

Write the record in the KB's language: headings, labels, the state markers' wording, and numbers in that language's format (`12,5` in `pt-PT`). Mistake kinds are stored in English in the frontmatter (`concept`, `calculation`, …) but shown translated in the record (e.g. `conceito`, `cálculo`, `incompleto`, `interpretação`, `notação`, `por responder`).

## Inputs

- **Assessment** (`type: assessment`): per question `topic`, `marks`, `scored`, `errors`, plus `attempt_date`, `paper` and `estimated_grade`.
- **Quiz session** (`type: quiz`): per question `topic`, `result` (`right`, `hinted`, `wrong`) and `errors`, plus `date` and `style`. A `right` counts 1, `hinted` (right only after a hint) ½, `wrong` 0.

## By topic

For each topic (a wiki article) that appears in any input:

- **Attempts** — marks scored / possible summed over all assessments, and the percentage.
- **Last 3** — the topic's percentage in each of its last three assessments, oldest first.
- **Quiz** — points / questions over all quiz sessions on the topic, as a percentage.
- **State**:
  - from the assessments when the topic has **two or more** of them: 🔴 below 50%, 🟡 50–75%, 🟢 75% or more;
  - from its single assessment when it has **one**, with the same thresholds, marked as provisional — "(1 attempt)" in the KB's language — so the first mock exam already gives feedback;
  - otherwise (no assessment) from the quiz sessions, with the same thresholds, when the topic has **five or more** quiz questions — marked "(quiz)";
  - otherwise ⚪ not enough data. An exam-style result always wins over quiz results: as soon as a topic has one assessment, quizzes stop deciding its state.
- **Recurring mistakes** — mistake kinds seen at least twice on the topic, from either source.

## Study priority

List the 🔴 and 🟡 topics (including provisional and "(quiz)" states), ordered by state first (🔴 before 🟡) and then by the topic's band and weight in the course's exams article (🔥 before ⚠️ before 📎, heavier first). Show each with its state and its exam band. 🟢 and ⚪ topics are left out.

## Most frequent mistakes

Count mistake kinds over all inputs — `concept`, `calculation`, `incomplete`, `misread`, `notation`, `unanswered` — with the topics they happened on, most frequent first.

## History

Two tables, newest last: the attempts (number, date, paper, estimated grade, link to the assessment) and the quiz sessions (number, date, style, score, link).
