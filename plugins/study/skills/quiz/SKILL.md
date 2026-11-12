---
name: quiz
description: Run an interactive, adaptive quiz in the chat for a course inside a research knowledge base created by the knowledge-base skill — one question at a time, aimed at the user's weak spots (from the progress record) or at what weighs most in the exams, quick-fire (definitions, multiple choice, true/false, short calculations) or exam-style short open questions; Socratic feedback (a hint and a second try before the explanation, with its source), difficulty that follows the answers, questions and answers grounded in the KB. Saves each session and feeds the progress record. Use when the user wants to be quizzed, tested, asked questions or to practise in the chat — e.g. "faz-me perguntas de ENGCIA", "testa-me", "quiz de Bayes", "pergunta-me a matéria", "treina os meus pontos fracos", "quiz me".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(swipl *), AskUserQuestion
---

# Quiz

A tutor in the chat: asks, waits, nudges when the answer is wrong, explains with the source, and moves on to what the user needs next. No documents — what stays is the session's result, which feeds the course's progress record.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **One question per message**, then wait for the answer. Never ask the next question in the same message as the feedback on the last one unless the user asked for a fast pace.
- **Grounded in the KB.** Every question and every right answer comes from the wiki, `raw/` or the question catalog; feedback cites the article or slide. Questions with a calculation or code are checked by running them (in a temporary file in the scratchpad) before they're asked.
- **Socratic, not a quiz show.** On a wrong answer, give a hint and let the user try again once; only then explain. Don't lecture on right answers — confirm briefly and move on.
- **Never write into `raw/`.** Don't assume the KB is a git repository.
- **The KB's language**; technical terms stay as-is.

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`.

2. **Agree the options.** Use what the user said; ask only for what's missing, with these defaults:

   | Option | Values | Default |
   | --- | --- | --- |
   | Focus | weak spots (study priority of the progress record), exam weight (the exams article), chosen topics | weak spots if there's a record, otherwise exam weight |
   | Style | **quick** (definitions, multiple choice, true/false, short calculations) or **exam** (short open questions in the teacher's style) | quick |
   | Length | number of questions | 10 |

   Read the last few quiz sessions of the course so recent questions aren't repeated.

3. **Ask, one at a time.**
   - **Multiple choice and true/false** go through `AskUserQuestion` (2–4 options, plausible distractors drawn from real confusions — the recurring mistakes in the progress record are a good source). **Open questions** the user answers by typing.
   - **On a wrong answer**: say it isn't right (without giving it away), give one hint, and let them try again. Right after the hint counts as *hinted*; wrong twice, explain the answer with its source and classify the mistake (`concept`, `calculation`, `incomplete`, `misread`, `notation`).
   - **Adapt**: after a right answer, raise the difficulty or move to another topic; after a wrong one, make the next question easier and come back to that topic later in the session with a different question.
   - The user can stop at any time ("chega", "stop"): keep what was answered.

4. **Close the session in the chat**: the score (right = 1, hinted = ½, wrong = 0), a line per topic, the mistakes with their kind, what to review (wiki article and, when one exists, the section of the study summary), and a next step — e.g. a mock exam focused on weak spots.

5. **Save the session** following `templates/session.md` in the course's progress folder, as `../../references/progress.md` (the plugin's `references/` folder) lays out — e.g. `outputs/<area>/estudo/progresso-<course>/quizzes/quiz-NN.md`, `NN` the next session number. Its frontmatter records, per question, the topic, kind, a one-line summary of what was asked, the result and the mistake kinds.

6. **Rebuild the progress record** exactly as `references/progress.md` describes — from every assessment and quiz session, never patched. Quiz results only decide a topic's state while it has no marked attempt. If the KB has a dashboard, log the session as [`references/dashboard.md`](../../references/dashboard.md) says (`event quiz "Quiz de <topics>: <score>" --area <course> --count <questions>`).

## Notes

- A session with no answered question isn't saved.
- If the KB doesn't cover enough of a topic to ask about it, skip the topic and say so at the end instead of inventing questions.
- Never promote anything from a quiz into the wiki; a gap the quiz exposed in the wiki is worth a note — offer to capture it.
