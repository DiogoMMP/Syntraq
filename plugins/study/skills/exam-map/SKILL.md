---
name: exam-map
description: Map what a course's past exams ask, inside a research knowledge base created by the knowledge-base skill — find the exams in raw/ (whatever its structure), read them, classify every question by the wiki's own topic articles, and write into the wiki an exams article (format, topic × exam weight table, 🔥/⚠️/📎 ranking, trends, question types, repeated questions, the teacher's style, study priorities) plus a question catalog that other study skills draw real questions from. Incremental — later runs only read new exams. Use when the user wants to analyse past exams, know what comes up in an exam, map exam topics, or asks "o que sai no exame", "analisa os exames antigos", "mapa de exames", "que matérias saem mais", "exam analysis".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Skill, AskUserQuestion
---

# Exam map

Turns a course's past exams into durable knowledge in the wiki: what the exam looks like, which topics come up, how much they weigh, how that has changed, and every past question in a catalog. Everything else in the `study` plugin (summaries, mock exams, solved exams) reads from what this skill writes, so it lives in `wiki/` — never as a one-off in `outputs/`.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **`raw/` has no rules.** Never expect a folder structure or a naming convention there, never suggest one, never move or rename anything in it. Discover what each file is from its path, name and content, and ask when unsure.
- **Never write into `raw/`.** Don't assume the KB is a git repository.
- **The wiki is the single source of truth.** If the area already has an article about its assessment or exams, update that article instead of creating a parallel one. Never point the wiki at an output as a stand-in for content.
- **Write in the KB's language** (`language:` in `KB_GUIDE.md`); technical terms stay as-is. The templates in `templates/` are in English — translate their headings and prose.
- **Separate what the exams say from your reading of them.** Counts, weights and dates come from the papers; topic classification, rankings and priorities are interpretation and must be labelled as such in the article.
- **Never invent.** A page you can't read, a weight you can't find, a question you can't place — record it under "Limitations" instead of guessing.

## Steps

1. **Find the knowledge base.** If the user gave a path, use it. Otherwise look in the current directory (and immediate subdirectories) for a `wiki/` next to a `KB_GUIDE.md`. Confirm a single candidate before touching anything; ask if there are none or several. Read `KB_GUIDE.md`'s frontmatter: this skill needs `mode: research` (a code-mode KB has no exams to map — say so and stop). If there's no KB at all, offer to run the `knowledge-base` skill first.

2. **Pick the course.** The courses are the areas of the wiki (its top-level folders, and the groups in `wiki/index.md`). Use the one the user named; if it's ambiguous, ask with `AskUserQuestion`, listing the areas. One course per run — repeat for others.

3. **Load what's already there.**
   - `wiki/index.md` and the list of the area's articles — these are the topics questions get classified into.
   - The area's existing exams article, if any: an article whose title or content is about the course's assessment/exams (e.g. "Avaliação e Exames de X"), or one this skill wrote before (its frontmatter has `exam_map:`). Read its `exam_map.exams` list: exams already processed.
   - The area's question catalog, if it exists.
   - `wiki/sources.md`, to see which `raw/` files belong to this area.

4. **Discover the exams in `raw/`.** Build a candidate list from three signals, in order:
   - files under the `raw/` paths that `wiki/sources.md` (or the area's articles) already associate with this course;
   - within those paths and any folder named after the course, files whose path or name suggests an assessment — `exame`, `exam`, `teste`, `test`, `frequência`, `época`, `normal`, `recurso`, `especial`, `modelo`, `mini`, `quiz`, `resolução`, `correção`, `solução`, `solution`, in any language the folder uses;
   - PDFs/documents in those paths whose first page reads as an exam paper (a title like "Exame", a duration, marks per question).

   Name matching is only a first sieve: words like `test` or `exam` also match `ColorTest.zip` or `TMS-example.zip`. Discard a candidate when its content isn't an assessment (code, archives, slides).

   Classify each candidate, from its name, path and first page:
   - **exam** — with school year, sitting (normal / recurso / especial / …) and date when the paper states it;
   - **model exam** — a sample/specimen paper;
   - **test / mini-test** — a partial assessment during the semester;
   - **solution** — a worked solution or marking scheme, linked to the exam it solves;
   - **exercise sheet** (ficha) — only a weak signal; include it only if the user wants.

   **First run for this course:** show the list as a table (file → kind, year, sitting, date, solution) and ask the user to confirm or correct it — wrong entries, missing files, a different folder to look in. **Later runs:** only ask about candidates not already in `exam_map.exams` (or dismissed in `exam_map.ignored`). If nothing is new and no processed exam has disappeared, say so and stop.

5. **Read each new exam.** Read the file directly (PDF pages via `Read`). If it's scanned or the text comes out empty or garbled, use the `pdf` skill (OCR). Extracted text often mangles symbols — `∞` read as `8`, probabilities like `P(E|H)` garbled — so check formulas and numbers against the page image, and when the two disagree, the image wins. For each question and sub-question record: its number, marks (as % of the exam), the topic(s), the kind of question (explain/compare/comment, calculation, trace an execution, write code/rules, draw, multiple choice, …) and a one-line summary of what it asks — a summary, never the full text copied. If a solution exists, note where each answer is.

6. **Classify by topic.** Topics are the area's wiki articles, written as `[[Article]]` links, so other skills can join the exam data with the study material. When one article covers several things the exams treat as separate topics (e.g. Bayes and fuzzy logic in one article on uncertainty), the topic is that article plus the part: `[[Article]] — part`, named after the article's own section, and used the same way everywhere.
   - A question that mixes topics is split by the marks of its sub-questions; when a single sub-question mixes two, give it to its main topic.
   - A question no article covers gets a short plain-text topic marked as having no article, and goes in the report as something for `compile-wiki` to cover.
   - Keep the classification consistent across exams: the same kind of question gets the same topic every year.

7. **Write the exams article.** Update the existing one if step 3 found it — keeping what it already says that this skill doesn't produce (e.g. the course's assessment rules), merging rather than overwriting — or create `wiki/<area>/` + `Exams of <course>` translated to the KB's language (e.g. "Exames de ENGCIA"). Follow `templates/exams.md`:
   - **Sources** — one row per paper, linked to its `raw/` file, with ✓ when a solution exists.
   - **Format** — duration, materials allowed, number of questions and marks, per sitting, and how it changed over the years.
   - **Topic × exam** — weight of each topic in each exam (% of the grade), the number of exams it appears in, and its average weight overall. Columns ordered by date.
   - **Ranking** — 🔥 appears in at least half of the exams, ⚠️ in 25–50%, 📎 in fewer than 25%. Write the rule in the article. Within a band, sort by total weight.
   - **Trends** — topics that appeared or stopped appearing, shifts towards or away from practical questions, changes in format — always citing the years.
   - **Question types**, **repeated questions** (near-identical questions across years, with their catalog ids), and **the teacher's style** (verbs used, notation, how questions are phrased, what earns marks when solutions show it).
   - **Study priorities** — labelled as interpretation of the numbers above.
   - **Limitations** — unreadable pages, ambiguous classifications, missing years.

   Frontmatter, so later runs are incremental:

   ```yaml
   exam_map:
     course: <area>
     updated: <today>
     exams:
       - raw/<path to each processed paper>
     ignored:
       - raw/<candidates the user said are not exams>
   ```

8. **Write the question catalog** — `Question catalog of <course>` translated (e.g. "Catálogo de perguntas de ENGCIA"), next to the exams article, following `templates/question-catalog.md`: one row per question or sub-question, with a stable id (sitting letter + year + question, e.g. `N23-P3b`, `R21-P2`; `M-P1` for a model exam), link to the paper, topic, kind, marks, the one-line summary and a link to its solution when there is one. Ids never change once given, so other skills and notes can cite them. When a course has more than one paper of the same kind in the same school year (two tests, two model exams, a second recurso), the first keeps the plain prefix and each later one gets a letter after the year — `T23-P1`, then `T23b-P1`, `T23c-P1`; for model exams, `M-P1`, then `Mb-P1` — in the order the papers are dated, or found when they have no date. Never rename an id already issued to make room for a new paper.

9. **Keep the KB consistent.**
   - Add or update a row in `wiki/sources.md` for every paper processed (summary: "exam
     <sitting> <year>", articles: the exams article and the catalog), so `compile-wiki` doesn't
     process it again.
   - Link both articles from `wiki/index.md` under the course, and from the topic articles' own text only where it helps (e.g. "comes up in 9 of 12 exams — see [[Exams of X]]").
   - **Deleted papers:** if a file in `exam_map.exams` no longer exists, apply `compile-wiki`'s deletion rule — guard against an unmounted `raw/` link (stop if `raw/` doesn't resolve or most papers vanished at once), show what would change, and only remove its columns, rows and catalog entries on a yes. A file that reappears elsewhere is a move: update the path.
   - **Duplicates in `outputs/`:** if `outputs/` already holds an analysis of this course's exams, say that it now repeats the wiki and suggest marking it `promoted → [[Exams of X]]` (in the KB's language) once the user has checked nothing in it is missing from the article. Don't edit or move it.

10. **Show changes before applying them the first time.** On the first run against an existing article, summarise in chat what will be added, rewritten or kept, and wait for a yes before writing. New articles, and later incremental runs, can be written directly.

11. **Report**: how many papers were read (and which were skipped or unreadable), the 3–5 🔥 topics with their numbers, the main trend, topics without an article, and whether an `outputs/` analysis now duplicates the wiki. Before reporting, if the KB has a dashboard, write the course's `exam-map.json` from the article's ranking, and its `grade_scale`/`pass_grade` in `course.json` when the course's rules state them, as [`references/dashboard.md`](../../references/dashboard.md) says. Then log the run (`event exam-map "Mapeou N exames" --area <course> --count N`).

## Notes

- Don't summarise the course content here — that's the study material's job. This skill only describes what the exams ask.
- Exam papers are the user's own course material: link to them and summarise questions in a line, never reproduce whole papers in the wiki.
- When `raw/` changes layout between semesters (folders archived, renamed), a run finds papers under new paths: treat matching files (same name and content) as moves, not as deleted plus new.
