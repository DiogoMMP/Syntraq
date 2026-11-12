---
name: solve-exam
description: Solve an exam paper or an exercise sheet using only the course's own material, inside a research knowledge base created by the knowledge-base skill — the methods, notation and language the course teaches, with the source of every answer cited, answers sized to the marks and exam time, what likely earns the marks, the official solution followed when raw/ has one, out-of-scope parts flagged and only answered on request, and calculations and code verified by running them. Complete solutions or hints only; a single question is answered in chat. Saves printable Word/PDF files. Use when the user wants an exam, a past paper, a question or an exercise sheet solved or explained — e.g. "resolve o exame normal de 23/24", "resolve a ficha 3", "como se resolve a 3b?", "dá-me só pistas", "solve this exam", "walk me through this question".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(pandoc *), Bash(swipl *), Bash(winget install *), Bash(brew install *), Bash(sudo apt-get install *), Skill, AskUserQuestion
---

# Solve exam

Solves a paper the way the course would: with its methods, its notation and its depth, citing where each answer comes from in the KB. The point is to learn to answer *this* course's exams, not to produce a generic solution.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **Only the course's material.** Every answer rests on the wiki or `raw/` and cites it. When a question needs something the KB doesn't cover, say so and ask before answering it from general knowledge — and then mark that part as outside the KB. Never blend the two silently.
- **The course's way, not another one.** Use the method, notation and terminology of the slides and solutions, even when another textbook does it differently.
- **Never guess.** If a statement is ambiguous or illegible, say how you read it. If an answer can't be checked, say it wasn't verified.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository.
- **Write in the KB's language**; technical terms stay as-is. The template is in English — translate its headings and labels (frontmatter keys stay in English).

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`. Infer the course from the paper (its path in `raw/`, its header) when you can; ask if it's ambiguous.

2. **Identify the paper.** It can come as:
   - a file in `raw/` — by path or by description ("o normal de 23/24", "a ficha 3"), found with the exam map's sources and `wiki/sources.md`;
   - one or more ids from the question catalog (`N23-P3`, "the Bayes questions");
   - a PDF or a photo outside the KB, or text pasted in the chat. Read it whole (PDFs with `Read`, the `pdf` skill for scanned ones). For a long exercise sheet, ask which exercises to solve.

3. **Pick the mode.** What the user said wins; otherwise:
   - **complete** (default) — the full solution;
   - **hints** — graded hints towards the answer without giving it, for trying it first.
   - **A single question** ("como se resolve a 3b?") is answered **in the chat**, with its sources, and then offer to save it as a file. The remaining steps about files don't apply.

4. **Gather the material.**
   - The wiki articles for the topics of each question, and `raw/` for the exact detail — the method as it was taught, the notation of the slides, a worked example in an exercise sheet.
   - The exam map (exams article and catalog), for the teacher's style and what tends to earn marks.
   - **The official solution**, when `raw/` has one for this paper (the exams article marks it ✓). Follow it, and where you disagree with it, say where and why instead of correcting it silently.

5. **Check the scope before solving.** List any question, or part of one, that needs something the KB doesn't cover, and ask with `AskUserQuestion` whether to answer it anyway (marked as outside the KB) or leave it out.

6. **Solve**, following `templates/solution.md`, one section per question with its catalog id when it has one:
   - **Answer** — what to write in the exam, sized to the marks and the time available (a one-hour paper with five questions of 20% leaves about ten minutes each);
   - **Why** — the reasoning, step by step, at the course's level;
   - **What earns the marks** (`Exam box`) — from the official solutions and the teacher's style in the exam map, labelled as interpretation;
   - a closing line with the sources (wiki article, slide/page) and whether it was verified. In **hints** mode, each question gets graded hints (first a nudge, then the method, then the key step) and what the answer should look like — never the answer itself.

7. **Verify** every answer that can be run: calculations with Python, Prolog with SWI-Prolog (`swipl`), Python code by running it, other languages when their tool is installed. Write the check in a temporary file in the scratchpad — never in `raw/` or the KB — run it, and fix the answer if they disagree. Mark the rest as not verified, with the reason.

8. **Check the renderer** as `study-summary` step 2 does (pandoc — ask before installing — and python-docx).

9. **Save it where the KB says.** Find the study purpose folder as `../../references/study-folder.md` describes:
   ```
   outputs/<area>/<study>/<solution>-<paper>/<solution>-<paper>.md / .docx / .pdf
   ```
   with the names in the KB's language and `<paper>` a short slug of the paper (e.g. `resolucao-normal-23-24`, `resolucao-ficha-3`). Versioned like summaries: the name never changes; a new solution starts at version 1, solving it again with changes bumps `version` and sets `updated`; the version and date are on the cover and in the footer. No changelog. When the paper isn't in `raw/` (pasted or photographed), quote the statement of each question in the solution itself — never copy anything into `raw/`.

10. **Render** with `python <plugin>/scripts/render.py <file.md>` (the plugin's `scripts/` folder, two levels above this skill). Exit code 3: pandoc missing (back to step 8); 4: fix the markdown.

11. **Index it.** One short row in the index table of `outputs/README.md` (type: solution, what for: one sentence, status: the KB's word for *final*, as listed in `outputs/README.md` — e.g. `final` in `pt-PT`), or update the existing row's date and version.

12. **Keep the KB consistent.**
    - Never promote a solution into the wiki. If solving surfaced something the wiki doesn't say (a method detail, a worked example), offer to capture it as a note.
    - If the paper is an exam the exam map doesn't have yet, suggest running `exam-map`.
    - Don't touch the question catalog: its solution column is for official solutions in `raw/`.

13. **Report**: the questions solved, those left out or answered outside the KB, disagreements with the official solution, what was verified and what wasn't, and whether the PDF was produced. Before reporting, if the KB has a dashboard, log the run as [`references/dashboard.md`](../../references/dashboard.md) says (`event solve-exam "Resolveu <paper>" --area <course>`).

## Notes

- Marking an attempt the user made is not this skill's job — that's `correct-attempt`.
- Mock exams made by `mock-exam` already come with their solutions; point the user there instead of solving them again.
