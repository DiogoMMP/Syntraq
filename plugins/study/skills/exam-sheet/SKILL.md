---
name: exam-sheet
description: Write a dense exam-consultation sheet (a "folha de consulta" / cheat sheet / formula sheet; Word .docx + PDF only) for a course, a block of it or a few topics, inside a research knowledge base created by the knowledge-base skill — pages in two columns with small type, telegraphic content (definitions, formulas, rules, tables, methods, traps, no prose and no sources) to fit as much of what the exams ask into as few pages as possible, with the space and the detail weighted by the exam map, a page budget (from what the exams allow, or chosen by the user) and a sample of the layout shown before the full sheet is written; ends by having a fresh agent try the past exams with only the sheet and filling whatever is missing (coverage-check). Use when the user wants a sheet to take to an exam, a consultation page, a formula sheet or the "cábula" — e.g. "faz-me a folha de consulta de ENGCIA", "quero uma folha A4 para levar ao exame", "formulário para o exame", "resumo de duas colunas com letra pequena", "cheat sheet", "formula sheet".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(pandoc *), Bash(pdftoppm *), Bash(winget install *), Bash(brew install *), Bash(sudo apt-get install *), Skill, Agent, AskUserQuestion
---

# Exam sheet

A different document from the summary: the summary teaches, the sheet **reminds**. It is for an exam where the student may bring notes, or for a last look the night before — so it carries what the exams actually ask for in the least space, in a layout built for density:

- **Two columns, small type** (7.5 pt by default), narrow margins, no cover, no table of contents, no page break per topic — as many pages as the budget allows and no more.
- **Telegraphic content**: definitions in one line, formulas, rules, tables, methods as numbered steps, one-line examples and traps. No explanations of why, no prose a formula already says, no repeating a heading in its first sentence.
- **No sources anywhere** — not at the end, not in the margins, no "see slide 12". Just the content.

Like every study document it is a view of the knowledge base; the knowledge itself stays in the wiki.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long.
- **`raw/` has no rules and is never written to.** Read whatever is there. Don't assume the KB is a git repository.
- **Grounded in the KB, uncited in the document.** Every definition, formula and rule comes from the wiki or `raw/`, in the course's notation; none of it is cited in the sheet. Anything from general knowledge is left out unless the user approves it (and then marked `*` with a line in the report, never in the sheet). Never fill a gap with a guess; when the KB doesn't have something an exam question needs, say so in the report.
- **Missing from the wiki is not missing from the KB**: go to `raw/` for the exact formula, table or step the wiki summarised away.
- **Write in the KB's language** (`language:` in `KB_GUIDE.md`); technical terms stay as-is. `templates/sheet.md` is in English — translate its labels and frontmatter values.
- **No changelog** — only the version and the date, in the footer.
- **The exam decides.** What goes in, and how much room it gets, is decided by what the exams ask (the exam map), not by how much the course says about it: a 🔥 topic gets every formula and method an exam question needs; a topic that never comes up gets a line, or nothing if the budget is tight.

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`: a `wiki/` next to a `KB_GUIDE.md` with `mode: research`; the course is one of the wiki's areas (ask if ambiguous).

2. **Check the renderer** exactly as `study-summary` step 2 does: `pandoc` (ask before installing) and `python-docx`. There is no Mermaid in a sheet and PyMuPDF (`python -c "import fitz"`) is only needed to count the pages of the PDF and for figures — ask before `python -m pip install pymupdf`; without it the page count is read from the PDF some other way (`pdftoppm`/Word) or, if it can't be, estimated and reported as an estimate.

3. **Agree the scope and the budget.** Use what the user said; ask only for what's missing:
   - **Scope** — the whole course, a block, a list of topics, or **my weak spots** (the 🔴 and 🟡 topics of the progress record, in study-priority order).
   - **Page budget** — look first in the course's exams article and the exams themselves for what is allowed to bring (consultation allowed or not, how many sheets/sides, size) and propose that; otherwise ask how many pages (default: 2 A4 pages = 1 sheet front and back). A sheet the exam doesn't allow is still fine as a last-minute revision — say so, and ask the budget.
   - **Density** — default 2 columns, 7.5 pt, margins 1 cm, portrait; the user can ask for more compact (down to 6 pt, 3 columns, landscape) or easier to read (up to 9 pt). Print legibility wins over cramming: below 6 pt isn't offered.

4. **Gather the material.**
   - The exam map (exams article and question catalog): each topic's weight and the real questions. For every real question in the catalog, work out the knowledge it needs — definitions, formulas, tables, methods — and make sure the sheet will carry it. Without an exam map, say so and offer to run `exam-map` first; if the user goes on without it, build the sheet from the wiki alone, weighting by how much space the course gives each topic, and say in the report that the exams couldn't guide it.
   - The wiki for the topics in scope, and `raw/` for the exact detail (through `wiki/sources.md`): the formulas, the tables, the steps of every method, the slides' notation.
   - The progress record, if there is one: the user's recurring mistakes become one-line traps; the weak topics get the room.
   - Anything the exam rules say that changes the content (e.g. a table of values is given on the paper, so the sheet doesn't need it).

5. **Show the outline and a sample, and wait for a yes.** Before writing the whole sheet:
   - the topics in order of the sheet (course order, or by weight when the budget is tight), each with its band (🔥/⚠️/📎) and the approximate share of the budget it gets;
   - what the exams need that the KB doesn't have, after searching `raw/`;
   - **a rendered sample of the layout** (the example): write the first one or two topics for real, following `templates/sheet.md` and the style rules of step 6, render them with `render.py` (step 8) into the scratchpad and **show the user the PDF/Word** (the path, or send it with `SendUserFile` where available; read it back yourself as an image to check it). Ask whether the type size, columns and density are right. Adjust before writing the rest. The sample is a temporary file and is never kept.

6. **Write the sheet source** following `templates/sheet.md`, in a temporary working folder (the scratchpad or the system temp folder, never inside the KB). The frontmatter's `layout: sheet`, `columns`, `font-size`, `margin` (and `orientation`) are read by the renderer. Style rules — each one saves space:
   - One `#` heading per topic (with its band emoji, which the renderer turns into ●●● ●●○ ●○○) and `##` only where a topic has real sub-parts. No cover, no contents, no legend, no preface, no "sources" section.
   - **Telegraphic**: `**Def.** …` in one line; formulas as `$…$` (display `$$…$$` only for tall ones); rules as `cond ⇒ result`; methods as `1) … 2) … 3) …` on one line when short; abbreviations the course uses; symbols (→ ⇒ ∴ ≠ ≈ ∈) instead of words. No full sentences that explain what a formula says, no motivation, no history.
   - **Tables for anything with cases, parameters or comparisons** — they are the densest form; keep cells to a few words. A table that does the job of a paragraph replaces it.
   - **One-line worked examples** only where the method isn't obvious from its steps (`Example box`: statement → result). **One-line traps** only for the mistakes that cost marks (`Warning box`, from solutions, marking criteria and the user's recurring mistakes).
   - Code only as the minimum snippet an exam question needs, in a fenced block with the language.
   - Figures only when a formula can't replace them (a curve, a table-as-image the exam expects you to read): crop just the figure from `raw/` (PyMuPDF, ~200 dpi), `width` in % of the **column**, and never a decoration. No Mermaid diagrams.
   - **No sources, no citations, no page or slide numbers, no `[[links]]`, no notes addressed to the reader.** A remark about the content that must be flagged (a formula the KB gives two ways) is a `Note box` of one line.

7. **Check it against the exams** with the `coverage-check` skill on the source (it launches fresh agents that try the past exams using only the sheet, reports what they couldn't answer and what was missing, and this skill fills the gaps from `raw/` — compactly, inside the budget — and checks again). This is not optional when the course has exams in `raw/`; it is skipped, with a line in the report, when it has none. Give it the budget so that gaps are closed by making room (shorten what the exams ask for least), never by growing past the budget.

8. **Render and fit the budget**: `python <plugin>/scripts/render.py <temporary-source.md>` (the plugin's `scripts/` folder, two levels above this skill). Count the pages of the PDF (`fitz.open(pdf).page_count`, or the page count Word/LibreOffice gives).
   - **Over budget**: tighten in this order — reword the longest items, merge tables, cut 📎 topics' detail, then `font-size` by 0.5 pt down to 6, `margin` down to 0.7 cm, a third column — and render again; never cut a thing a 🔥 topic's exam question needs (run `coverage-check` again if you cut anything substantial). If it still doesn't fit, stop and tell the user what is left out and what to choose.
   - **Under budget by a lot** (a page or more of white): raise `font-size` up to 8.5 pt for legibility, or ask the user whether to add the ⚠️/📎 topics that were left out.
   - Look at the PDF's pages as images: nothing cut, tables not overflowing a column, no formula wider than the column, no orphaned heading at the bottom of a column.
   - Exit code 3 means pandoc is missing — back to step 2; 4 means pandoc rejected the source — fix the markdown. If the PDF was skipped (no Word or LibreOffice), report that the `.docx` is ready, that the page count couldn't be checked and that the budget is therefore unverified.

9. **Save it where the KB says.** Find the study purpose folder as `../../references/study-folder.md` describes. Each sheet is its own folder, named by scope, without a date:
   ```
   outputs/<area>/<study>/<sheet>-<scope>/
   ├── <sheet>-<scope>.docx
   └── <sheet>-<scope>.pdf
   ```
   `<sheet>` is "exam sheet" in the KB's language (e.g. `folha-consulta` in `pt-PT`), `<scope>` a short slug (the course's own name for the whole course, or the block or topic). Only the Word and the PDF are kept — no markdown of the sheet. Versions: the names never change and the files hold the latest version; read the current version from the existing `.docx` footer or its file properties; a new sheet starts at version 1, regenerating with content changes bumps the version and sets the date to today; re-rendering without content changes keeps both. Publish only when the render succeeded (move the `.docx` and, if produced, the `.pdf`; if no PDF was produced, remove the previous version's `.pdf`), then delete the temporary working folder.

10. **Index it.** Add one short row to the index table of `outputs/README.md` (type: exam sheet; what for: one sentence including the page budget; status: the KB's word for *final*), or update the existing row's date and version.

11. **Keep the wiki the single source of truth.** A sheet is never promoted into the wiki. If writing it surfaced something the wiki doesn't say (a formula, a detail from `raw/`), offer to capture it as a note (`capture-note`).

12. **Report**: the file(s) written, version, pages against the budget, the font size and columns used, the coverage of the past exams before and after the check (and what is still missing, and why), what the KB didn't have, and whether the PDF was produced.

## Notes

- The sheet is made to be printed: no colour-only meaning (the tables' alternating rows are decoration), nothing that needs a screen.
- Don't use it to replace the summary. If the user needs to *understand* a topic, point to `teach` or `study-summary`.
- A sheet that is allowed in the exam is the user's own preparation; remind them to check the exam's rules about what may be brought (typed vs. handwritten, size, content) — the skill only reads what the exams say, it can't know the current rules.
