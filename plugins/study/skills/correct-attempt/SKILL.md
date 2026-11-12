---
name: correct-attempt
description: Mark an attempt the user made at a mock exam, a past exam or an exercise sheet, inside a research knowledge base created by the knowledge-base skill — read their answers (photo, scan, PDF or typed), confirm unclear handwriting before marking, mark each question criterion by criterion against the best reference available (mock-exam solutions, the official solution, a solve-exam solution, or one made on the spot), as strictly as the course's teacher, classify every mistake, give an estimated grade on the course's scale, and keep a per-course progress record of weak spots (by topic, crossed with exam weight) that mock-exam and study-summary read. Use when the user wants an answer, an attempt or a practice exam marked, graded or checked, or asks about their weak spots or progress — e.g. "corrige o meu simulado", "vê se isto está certo", "quanto teria neste exame?", "corrige a minha resolução da ficha 3", "quais são os meus pontos fracos?", "mark my attempt".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(cp *), Bash(python *), Bash(py *), Bash(pandoc *), Bash(swipl *), Bash(winget install *), Bash(brew install *), Bash(sudo apt-get install *), Skill, AskUserQuestion
---

# Correct attempt

Marks what the user wrote the way the exam would, explains every lost mark, and keeps a record of where they keep losing them. The record is about the student, not the subject, so it never goes into the wiki.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **Mark what was written, not what was meant.** Transcribe faithfully; when handwriting is unclear, ask instead of guessing in either direction.
- **As strict as the teacher.** Use the marking criteria of the reference and the teacher's style in the exam map. Partial credit only where the criteria give it.
- **The grade is an estimate**, always labelled as such, against a named reference.
- **Ground every correction in the KB** — the reference, the wiki article, the slide. Verify calculations and code by running them.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository.
- **Write in the KB's language**; technical terms stay as-is. The templates are in English — translate their headings and labels (frontmatter keys and error kinds stay in English).

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`.

2. **Get the attempt and the paper.** The attempt can be photos, a scan, a PDF or answers typed in the chat. Work out which paper it answers — a mock exam from `mock-exam`, a past exam or an exercise sheet in `raw/`, catalog questions — from what the user says or from the attempt itself; ask if it's unclear. A partial attempt (some questions only) is fine: mark only what was attempted, and record the rest as not attempted rather than as zero, unless the user says it was done under exam conditions.

3. **Transcribe.** Read every answer (images and PDFs with `Read`, the `pdf` skill for scans). For handwriting, show the transcription of anything unclear — a word, a symbol, a number — and wait for the user to confirm or correct it before marking.

4. **Choose the reference**, the first that exists:
   1. the mock exam's solutions (they carry marking criteria per question);
   2. the official solution in `raw/` (the exams article marks it ✓);
   3. a `solve-exam` solution of this paper in the study folder;
   4. none: solve the paper first, the way `solve-exam` does (course material only, verified), and say that the grade is less reliable because no official criteria exist. Without explicit criteria, split each question's marks into criteria from the reference answer before marking, and show that split in the assessment.

5. **Mark each question, criterion by criterion**:
   - marks scored out of possible, per criterion and per question;
   - what's right; what's missing or wrong;
   - **the kind of each mistake** — `concept`, `calculation`, `incomplete`, `misread` (answered a different question), `notation`, `unanswered` (with a note when it looks like time ran out);
   - how to get it right, linking the wiki article and, when one exists, the study summary. Recompute numbers and run code the user wrote (in a temporary file in the scratchpad, never in `raw/` or the KB) to tell a wrong method from a slip.

6. **Estimate the grade** on the scale the course's papers use (e.g. 0–20; the exam map's format section says), from the weighted marks.

7. **Show the result in the chat** — estimated grade, a line per question, the two or three things to review first — then save it.

8. **Save it where the KB says.** Find the study purpose folder as `../../references/study-folder.md` describes; everything about the student's attempts lives in one folder per course:
   ```
   outputs/<area>/<study>/<progress>-<course>/
   ├── <progress>-<course>.md
   └── <attempts>/
       ├── NN-<paper>.md
       └── NN-<paper>-original-1.<ext>, -original-2.<ext>, …   (only when the file isn't already in the KB)
   ```
   with the names in the KB's language (e.g. `progresso-engcia/tentativas/01-simulado-1.md`). `NN` is the next attempt number for the course (01, 02, …); `<paper>` a short slug of what was attempted. Write the assessment following `templates/assessment.md` — its frontmatter records each question's topic, marks, score and mistake kinds, which is what the progress record is built from. Since the assessment is never rendered, write it for Obsidian: no `::: {custom-style="…"}` boxes (they only work in the Word/PDF renderer and show up as raw text in Obsidian) — use callouts (`> [!warning]`) instead. Keep the files to the minimum: the assessment is the `.md` alone — no `.docx`, no `.pdf`. The user's own file (photo, scan, PDF) is copied next to it, as `NN-<paper>-original-1.<ext>`, `-original-2.<ext>`, … in the order given, **only when the KB doesn't already hold it** — first look for it in the KB, `raw/` included (the same file may be there, e.g. an exam they solved or a mock exam of theirs, or an attempt saved before). If it's already there, don't copy it: list its existing path in the assessment's `original:` field instead. The same goes for a mock exam or past exam the attempt answers — never copy those from `raw/` or from the study folder. Anything the user only typed in the chat needs no copy: the transcription in the assessment is the record. `original:` lists every file the assessment relies on, copied or already in the KB.

9. **Rebuild the progress record** `<progress>-<course>.md` exactly as `../../references/progress.md` describes (the plugin's `references/` folder): rebuilt from the frontmatter of every assessment in `<attempts>/` and every quiz session in `<quizzes>/`, never patched — by topic (attempts, last three, quiz, state, recurring mistakes), study priority crossed with exam weight, most frequent mistakes, and the history. Follow `templates/progress.md` for its layout.

10. **Report**: the estimated grade, what to review first (from the study priority), and a next step — e.g. a mock exam focused on weak spots (`mock-exam`), or the summary sections of the 🔴 topics. Before reporting, if the KB has a dashboard, log the attempt as [`references/dashboard.md`](../../references/dashboard.md) says (`event correct-attempt "<paper> — <grade>" --area <course>`). `progress.json` was already written in step 9.

## Questions about progress

"Quais são os meus pontos fracos?" or "como estou a ENGCIA?" — read the progress record and answer from it in the chat; don't mark anything. If there's no record yet, say so and suggest marking an attempt or doing a `quiz` first.

## Notes

- Never promote anything from here into the wiki. A mistake that reveals the wiki explains something badly or not at all is worth a note — offer to capture it.
- An attempt at the same paper again is a new attempt with its own number; the record shows the progression.
