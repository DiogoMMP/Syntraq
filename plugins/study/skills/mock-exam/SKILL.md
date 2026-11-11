---
name: mock-exam
description: Create complete mock exams for a course inside a research knowledge base created by the knowledge-base skill — same format, duration, marks and style as the course's real past exams (from the exam map), topics chosen by their exam weight and trends, new questions or variants that can be answered with the material in the KB (or a compilation of real past questions), with the paper and the solutions (model answers, marking criteria, mistakes that lose marks) as separate printable Word/PDF files. Computational answers are checked by running them. Use when the user wants a mock exam, a practice exam, a simulation of the exam or exam-style questions to practise — e.g. "cria um simulado de ENGCIA", "faz-me um exame de treino", "simula o exame de recurso", "quero praticar para o exame", "mock exam", "practice exam".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(pandoc *), Bash(swipl *), Bash(winget install *), Bash(brew install *), Bash(sudo apt-get install *), Skill, AskUserQuestion
---

# Mock exam

A practice exam that feels like the real one: the same structure, marks, duration and phrasing as the course's past papers, on the topics that actually come up, with a separate solutions document to mark yourself against. Like all study material, it's a printable view of the KB — never promoted into the wiki.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository.
- **Every question must be answerable from the KB alone** — the wiki and `raw/`. A question that needs something the course doesn't teach is out, however good it is.
- **The paper gives nothing away**: no topic names, no 🔥/⚠️/📎 bands, no catalog ids, no hints that the real papers don't have. All of that lives in the solutions.
- **New questions are new** — a variant changes data, context or what is asked; it never copies a real question with cosmetic edits. Only the *compilation* mode uses real questions, and then says so.
- **The solutions must be right.** Anything that can be computed or run is checked by running it; what can't be checked is marked as not verified, never presented as checked.
- **Write in the KB's language**; technical terms stay as-is. The templates are in English — translate their headings, labels and frontmatter values (keys stay in English).

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`.

2. **Load the exam map.** The course's exams article and question catalog (written by `exam-map`) give the format per sitting, the topic weights and trends, the question types, the teacher's style and the real questions. Without them there's nothing to imitate: say so and offer to run `exam-map` first. Also read the frontmatter of the course's earlier mock exams' solutions, if any, to know which variants were already used.

3. **Check the renderer** exactly as `study-summary` step 2 does: pandoc (ask before installing it; without it, write only the `.md` files) and python-docx.

4. **Agree the options.** Use what the user said; ask only for what's missing, offering these defaults:

   | Option | Values | Default |
   | --- | --- | --- |
   | Sitting to imitate | normal, recurso, especial, model — whatever the course has | normal |
   | Scope | whole course, chosen topics or blocks | whole course |
   | Difficulty | same as the real papers, harder, easier | same |
   | Mode | **new** (new questions and variants) or **compilation** (real past questions from different years, assembled into one paper) | new |
   | How many | one, or several different mock exams | one |
   | Focus | **exam weight**, or **weak spots** (from the progress record `correct-attempt` keeps) | exam weight |

5. **Plan the paper and wait for a yes.**
   - **Structure**: the duration, materials allowed, number of questions and marks of the chosen sitting, taking the most recent years as the reference when the format changed.
   - **Topics**: drawn by exam weight and trend — every 🔥 topic in scope covered, some ⚠️, occasionally a 📎; recent trends weigh more than old papers. Stay inside the chosen scope. With **weak spots** focus, read the course's progress record (`<progress>-<course>.md` in the study folder) and follow its study priority instead: 🔴 topics first, then 🟡, still in the real papers' format and marks. Without a record, say so and fall back to exam weight.
   - **Question kinds** in the same mix as the real papers (explain/compare/comment, calculation, trace an execution, write rules or code, draw…).
   - **Variety**: avoid variants already used in earlier mock exams of this course. Show the plan as a table — question, marks, topic, kind, and for each one "variant of <id>", "new" or "real question <id>" — and only write after the user approves it.

6. **Write the paper** following `templates/paper.md`: the header the real papers have (course name as the papers state it, the sitting being imitated, duration, materials, marks), the general instructions they give, then the questions — in the teacher's verbs, notation and phrasing, with the marks of each question and sub-question. Questions as level-2 headings (`## Question 1 (20%)`), so the paper doesn't break a page per question. Data, code or diagrams a question needs go in the statement, in fenced code blocks or tables.

7. **Write the solutions** following `templates/solutions.md`, one section per question:
   - **model answer** — what a full-marks answer contains, at the depth the marks justify;
   - **marking criteria** — how the marks split across the parts of the answer;
   - **mistakes that lose marks** (`Warning box`) — from the real solutions and marking schemes when they exist, otherwise from the topic's common mistakes;
   - a closing line with what it's based on (`variant of N23-P3b`, `new`, `real question R21-P2`), whether it was verified, and the wiki article for the topic. **Verify** every answer that can be: calculations with Python, Prolog with SWI-Prolog (`swipl`), Python code by running it, other languages when their tool is installed. Write the check in a temporary file (in the scratchpad, never in `raw/` or the KB), run it, and fix the question or the answer if they disagree. When no tool is available, mark it as not verified and say why. The solutions' frontmatter records, per question, its id, marks, topic, what it's based on and whether it was verified — the next mock exam reads it to avoid repeats, and a future correction skill reads it to mark an attempt.

8. **Save it where the KB says.** Find the study purpose folder as `../../references/study-folder.md` describes. Each mock exam is its own numbered folder — they are different exams, not versions of one:
   ```
   outputs/<area>/<study>/<mock>-<scope>-<n>/
   ├── <mock>-<scope>-<n>-<paper>.md / .docx / .pdf
   └── <mock>-<scope>-<n>-<solutions>.md / .docx / .pdf
   ```
   with the names in the KB's language (e.g. `simulado-engcia-1/simulado-engcia-1-enunciado.pdf` and `…-correcao.pdf`); `<n>` is the next free number for that scope.

9. **Render** both files with `python <plugin>/scripts/render.py <file.md>` (the plugin's `scripts/` folder, two levels above this skill). `toc: false` in the templates keeps the table of contents out. Exit code 3 means pandoc is missing (back to step 3); 4 means the markdown needs fixing.

10. **Index it.** One short row per mock exam in the index table of `outputs/README.md` (type: mock exam, what for: one sentence, status: the KB's word for *final*, as listed in `outputs/README.md` — e.g. `final` in `pt-PT`), pointing at its folder.

11. **Keep the wiki the single source of truth.** Never promote a mock exam into the wiki. If writing one surfaced something the wiki doesn't say, offer to capture it as a note.

12. **Report**: the files written, the topics covered and their marks, what was verified and how, what wasn't, and whether the PDFs were produced. Suggest doing the paper under exam conditions before opening the solutions. Before reporting, if the KB has a dashboard, log the run as [`references/dashboard.md`](../../references/dashboard.md) says (`event mock-exam "Simulado <name>" --area <course>`).

## Notes

- Several mock exams in one request: plan them together so they don't repeat topics' variants, show one table per paper, then write them in turn.
- Harder/easier changes the questions, never the format: same duration and marks as the sitting.
- The paper is meant to be printed: everything a question needs fits on A4 portrait.
