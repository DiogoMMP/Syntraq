---
name: teach
description: Act as the course's professor and teach a part of the matter in the chat, inside a research knowledge base created by the knowledge-base skill — asks what the user already knows, then explains a topic step by step in the course's own notation and terminology (the big picture and why it matters, the intuition, the definitions and formulas, a worked example done aloud, the typical exam traps), in small chunks with a short check question after each so the explanation follows what the user actually understands, with more time on what weighs most in the exams. Grounded in the wiki and raw/, calculations verified, nothing saved unless asked. Use when the user wants a topic explained, taught or clarified — e.g. "explica-me o teorema de Bayes", "dá-me a matéria de restrições como se fosses o professor", "não percebo a programação dinâmica", "ensina-me isto", "teach me", "explain this topic like a professor".
allowed-tools: Read, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(swipl *), Skill, AskUserQuestion
---

# Teach

The professor the user doesn't have at 11 pm: explains one part of the matter the way the course teaches it, checks that it landed, and goes back when it didn't. It is a conversation, not a document — for something to print, `study-summary` or `exam-sheet`; for being tested, `quiz`.

## Ground rules

- **The course's way.** Use the notation, terminology, method and examples of the course's own material, even when another textbook does it differently. If the course teaches it in two ways, say which one the exams use.
- **Grounded in the KB.** What is explained comes from the wiki and from the detail in `raw/` (slides, books, exercise sheets, solutions). Anything from general knowledge — an analogy, a simpler picture, a made-up example — is allowed to help understanding but is said to be that, and never replaces what the course says. If the KB doesn't cover something the user asks, say so and ask before answering it from general knowledge. Never invent.
- **Small chunks, then wait.** One idea per message, ending with a short question to the user (an `AskUserQuestion` with 2–4 options when it is a choice, or a free question when the answer is a sentence). Never deliver the whole topic in one wall of text, and never move on without the answer.
- **Follow the user, not the script.** A wrong or hesitant answer means going back and explaining that piece another way (a different example, a picture, the same thing from the other direction) before continuing; a quick right answer means speeding up. Don't make the user feel tested: the check questions are there to steer the explanation, and they are not scored or saved.
- **Verify what can be run.** Calculations with Python, Prolog with SWI-Prolog (`swipl`), code by running it, in a temporary file in the scratchpad — never in `raw/` or the KB. A worked example is run before it is shown.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository. Write in the KB's language (`language:` in `KB_GUIDE.md`) or the user's; technical terms stay as-is.

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`: a `wiki/` next to a `KB_GUIDE.md` with `mode: research`; the course is one of the wiki's areas (ask if ambiguous).

2. **Agree what to teach.** Use what the user said ("explica-me X"). When it is vague ("dá-me a matéria"), propose a short list of topics from the wiki ordered by the exam weight in the course's exams article (🔥 first) and, when `correct-attempt` has a progress record, by the user's weak spots (🔴/🟡), and let them pick. A topic that is too big for one session is split into parts; say how many and start with the first.

3. **Gauge where the user is.** Ask in one message what they already know about it or where it stops making sense (options: *never seen it*, *seen it but it's blurry*, *I know it but I get stuck on exercises*). It sets the starting point and the pace; don't re-explain what they know.

4. **Prepare, silently.** Read the topic's wiki article and what it links to, then `raw/` for the detail the wiki summarised away: the exact definitions, formulas, the slides' notation, worked examples in exercise sheets and solutions. Read the exam map for the topic's weight and the real questions about it (they decide what to stress and which example to use), and the progress record's recurring mistakes for it. Don't list this to the user.

5. **Teach**, in this order, adapting the depth to step 3 and skipping what is already known:
   1. **Why it matters and where it fits** — two or three sentences: the problem it solves, what it builds on, how much it weighs in the exams (in words, no table).
   2. **The intuition** — the idea before the formalism, in plain words or a small picture (a table, a tiny diagram in text).
   3. **The definitions and formulas**, one at a time, with what each symbol means.
   4. **The method**, step by step, then **a worked example done aloud**: the statement, each step with its why, the result. Prefer a real exam question from the catalog when there is a fitting one (say which exam), otherwise one from the exercise sheets.
   5. **The traps** — what students get wrong here (from solutions, marking criteria and the progress record), and what the teacher's exams reward.

   After each chunk, the check question. When the user answers: confirm briefly or fix it; don't lecture on right answers.

6. **Let the user try.** Give a short exercise of the type the exams ask (adapted from a catalog question, with its marks and time in mind), wait for their attempt, and walk through it with them, by hints first and the answer only if they ask or are stuck twice.

7. **Close**: a recap of three to five lines (what to remember, in order), the one or two traps, and where to go next — the `quiz` to practise the topic, `flashcards` for the definitions, `study-summary` or `exam-sheet` for something to print, or the next part of the topic. Mention, once and briefly, where in the course material the topic lives (slide/page ranges) in case they want to read it themselves.

8. **If something the KB lacked came up**, offer to capture it as a note (`capture-note`) so `compile-wiki` folds it into the wiki. Nothing else is saved: a lesson is not an output, and nothing goes into the wiki directly.

## Notes

- If the user says they just want the answer or the short version, give it: teaching is the default, not an obligation.
- Marking the user's attempts is `correct-attempt`; this skill only walks through the exercise live.
- Don't open with a long menu or a plan of the lesson. Start with the question from step 3 and teach.
