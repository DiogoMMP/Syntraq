---
name: coverage-check
description: Check that a study document (a summary or an exam sheet) is enough to answer the course's past exams, inside a research knowledge base created by the knowledge-base skill — hands the document and the exam questions to a fresh subagent that has seen nothing else, has it answer each question using only the document and report what it could not answer and exactly what was missing, then fills each gap from the wiki and raw/ and checks the failed questions again, until every question is answerable or the material genuinely isn't in the KB. Skipped when the course has no exams in raw/. Called at the end of study-summary and exam-sheet; also use it on its own when the user asks whether a document is enough for the exam — e.g. "dá para fazer o exame só com este resumo?", "verifica se a folha cobre os exames", "falta alguma coisa no resumo?", "check coverage".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Agent, Skill, AskUserQuestion
---

# Coverage check

The question it answers: *with only this document, could the student answer these exams?* The writer of a document can't judge that — they know where everything came from and fill the holes from memory without noticing. A fresh agent that has only the document can't, so what it fails to answer is exactly what is missing.

Used on the **source** of a document (the markdown that the renderer turns into Word/PDF) before it is rendered, so what the check finds is fixed before the files are produced.

## Ground rules

- **The checker sees only the document and the questions.** Never give it the wiki, `raw/`, the catalog's classification, the official solutions or the chat. It is told to answer from the document alone; where it would need something the document doesn't say, that is a gap, not something to fill from its own knowledge of the subject.
- **Fix gaps with the KB's own material.** Anything added comes from the wiki or `raw/`, in the course's notation — found by searching, never guessed. If neither has it, it stays a gap and goes in the report; never invent to make the check pass.
- **A gap is missing knowledge, not a hard question.** "Answerable" means every definition, formula, rule, table value and method step the question needs is in the document — not that the document contains the answer. A question that needs reasoning the student is expected to do is fine as long as its ingredients are there.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository. Temporary files go in the scratchpad, never in the KB.
- **Write in the KB's language** for anything the user reads; technical terms stay as-is.

## Steps

1. **Receive the inputs** (from the skill that called this one, or ask): the knowledge base and course (same discovery as `exam-map`), the path of the document's markdown source, what kind of document it is (`summary` or `sheet`) and, for a sheet, its page budget and whether it can still grow.

2. **Collect the questions.** The exams the exam map covers: read the question catalog and the exams article of the course, and for each exam the paper in `raw/` (found through `wiki/sources.md`/ the exams article). Use the question texts as they are on the papers (read PDFs with `Read`, the `pdf` skill for scanned ones), with their marks. If the course has **no exams** in `raw/`, or no exam map and no papers can be found, say so, do not check anything, and return "no exams to check against" to the caller. Don't ask the user to supply exams unless they were expecting one.

3. **Run the checkers.** Group the exams into at most four batches (one exam each when there are four or fewer) and launch one **fresh** subagent per batch with the `Agent` tool, all in the same message so they run in parallel (`subagent_type: general-purpose`). Each prompt is self-contained and contains: the path of the document, the question texts of its batch (as plain text files in the scratchpad if long), and these instructions:
   - *You are a student with a closed-book exam where you may use only this document. Read it first, completely. Then take each question in turn and try to answer it using only what is in the document.*
   - *Do not use your own knowledge of the subject to fill anything the document doesn't say: if you would have to recall a definition, formula, value, rule or method step that is not in the document, you are missing it.*
   - *For each question give: the verdict — `full` (everything needed is in the document), `partial` (some of it is) or `none`; your short answer; and, for `partial` and `none`, the list of what is missing, each item stated precisely (e.g. "the formula for the posterior odds", "what the 3rd step of the algorithm is", "the table of values for the standard normal"), plus the section of the document where you looked. Also list, for `full`, the sections you relied on.*
   - *Do not edit any file. Answer in the fixed format given.* Ask for a compact table, one row per question, with the question id.

   Never tell the checker what the right answer is, who wrote the document or what it is for beyond the above.

4. **Compare with the official solutions, where `raw/` has them** (the exams article marks them). For questions the checker called `full`, check its short answer against the official solution; a confident wrong answer means the document is misleading or incomplete on that point — count it as `partial` and note what led it astray. Don't give the solution to the checker.

5. **Aggregate.** One table: question id, exam, marks, verdict. Deduplicate the missing items across questions and group them by the document's topic (a missing item that blocks several questions is a priority). Compute the coverage as the share of the marks that are `full`.

6. **Fill the gaps.** For each missing item, find it: the wiki article of the topic first, then `raw/` for the exact definition, formula, table or step (through `wiki/sources.md`, or by searching `raw/`). Add it to the document's source, in the topic it belongs to and in the document's own style:
   - **summary** — in full, with the same depth as the rest of the section (and a worked example when the question needs the method applied);
   - **sheet** — compactly (a formula, a table row, a one-line rule), staying inside the page budget: when the sheet is full, make room by shortening what the exams ask for least (📎 topics, long wording, examples a formula already covers) — never by dropping something a 🔥 topic needs. If it can't fit, report it instead of overflowing the budget silently.
   - Don't put sources, slide numbers or "see the book" in the document. Write the content itself.
   When `raw/` doesn't have it, don't invent: it stays in the report as a gap the material can't close.

7. **Check again.** Launch fresh checkers (never reuse the earlier ones: they remember the document) on the questions that were not `full`, in the same way, against the updated source. Repeat the fill-and-check at most **two more rounds**; stop earlier when everything that can be closed is closed.

8. **Return to the caller, and report**: the coverage before and after (share of marks `full`), the questions still `partial`/`none` with exactly what is missing and why it couldn't be added (not in the KB / didn't fit the sheet), what was added per topic, and a note that the check is an estimate (a closed-book agent is not the student). When called on its own by the user, show the same report and ask whether to run `study-summary`/`exam-sheet` again, or to capture what the KB lacks as notes (`capture-note`) so `compile-wiki` brings it into the wiki.

## Notes

- Cost: up to four agents per round, at most three rounds. For a course with very many exams, check the most recent ones plus the ones the exam map marks as most representative, and say which were left out.
- A checker that gets a question about something visual (a figure on the paper) can't see it: mark those questions as not checkable and leave them out of the coverage, instead of calling them gaps.
- Never promote anything from the check into the wiki; what the KB lacks is worth a note — offer it.
