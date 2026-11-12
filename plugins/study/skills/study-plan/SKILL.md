---
name: study-plan
description: Build a day-by-day study plan up to one or more exams, inside a research knowledge base created by the knowledge-base skill — time per topic by exam weight × weakness × size, phases (material, practice, mock exams), daily flashcards, spaced review and buffer days, each day with concrete tasks that link the KB's material and the study skill to run. Shapes the plan around how the user studies. Saves a markdown plan with checkboxes and, after asking, sends it to the user's calendar, an .ics file or a Notion page. Also answers "what do I have today?" and replans when the user says what they did or didn't do. Use when the user wants a study plan, a revision schedule or a calendar up to an exam, or says they're behind — e.g. "faz-me um plano de estudo até ao exame", "o que tenho hoje?", "estou atrasado, replaneia", "study plan", "revision timetable".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), AskUserQuestion
---

# Study plan

A calendar to the exam that spends the time where it pays: on the topics that weigh most in the exams and where the user is weakest, with practice and mock exams before the day, and enough slack to survive a bad week.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **Plan with the user's real time.** Never assume hours or dates: ask for what can't be read from the KB.
- **Every task is a checkbox, everywhere.** In the markdown (`- [ ]`), in the Notion page (to-do items), whatever the template or database says — a template can decide the layout, never that tasks stop being checkable. If the Notion page has no checkbox property or block for them, add to-do items inside the page body anyway. The update mode relies on those checkboxes.
- **Tasks are concrete**: a section of a summary with its pages, catalog questions by id, a quiz on a topic, a mock exam — with the study skill to run for each. Never "study Bayes".
- **Nothing leaves the KB without a yes.** Creating calendar events, writing an `.ics` or writing to Notion is outward-facing or extra output: show what would be created and wait for confirmation, and never do any of them just because the plan was asked for.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository.
- **The KB's language**; the template is in English — translate headings, labels, frontmatter values (keys stay in English) and `exam_label`.

## Steps

1. **Find the knowledge base and the courses** — same discovery as `exam-map`. A plan can cover one course or several whose exams fall in the same season; then it is one plan that interleaves them.

2. **Ask for what the KB can't tell.** With `AskUserQuestion` where it fits:
   - the **date** (and time, if known) of each exam;
   - the **start** of the plan (default: today);
   - the **hours available** per weekday (e.g. 2 h on weekdays, 5 h on Saturday, none on Sunday);
   - **days off**;
   - **how they study** — it is individual, so ask instead of assuming (step 3).

3. **Ask how the user studies.** Don't impose a method. First look for hints in what exists — past plans, the progress record, the study folder (lots of summaries and few solved sheets says something) — and propose a default from them, then confirm with `AskUserQuestion`. Examples of what to settle (these are only examples; follow what the user says):
   - the **mix**: more reading/summaries or more exercises, and roughly in what proportion;
   - the **order**: all reading first and exercises after, or each topic read then practised straight away (interleaved);
   - the **session shape**: long blocks or short ones with breaks, best time of day, subjects per day;
   - how they like to **review**: flashcards, quizzes, rewriting, past exams — or which they dislike;
   - anything else they volunteer (e.g. weekends for mocks only, never two courses in one day).
   Record the answers in the plan's frontmatter (`study_style`) so replans reuse them without asking again unless the user wants to change them.

4. **Gather the data** for each course:
   - the exams article (bands, weights) and the question catalog;
   - the progress record (`references/progress.md` in the plugin): each topic's state 🔴/🟡/🟢/⚪ and the study priority;
   - the size of each topic, estimated from its wiki article and the number of slides/pages behind it in `raw/` (through `wiki/sources.md`);
   - the study material that already exists in the study folder — summaries, mock exams, flashcards, solved exercise sheets.

5. **Share out the time.** Hours per topic in proportion to **exam weight × weakness × size**, then split each topic's hours between reading and practice following the user's mix (step 3), with weakness 🔴 ×1.5, 🟡 ×1.2, ⚪ ×1, 🟢 ×0.6. Reserve 10–15% of the total as free buffer, and the daily flashcard time (15–20 min) before sharing out the rest. If the time can't cover the material, say so and propose what to cut (📎 topics already 🟢 first) rather than cramming.

6. **Lay out the phases** for each course, backwards from its exam, in the order the user chose in step 3 (the default below is reading first, then practice; an interleaved style merges phases 1 and 2 topic by topic):
   1. **material** — each topic's summary section, in course order;
   2. **practice** — exercise sheets and real catalog questions per topic, and a quiz per topic;
   3. **final stretch** — two or three mock exams under exam conditions, each followed by marking (`correct-attempt`) and a review of the mistakes; the last day before the exam light. Throughout: flashcards every study day; each topic comes back a few days after it was studied (spaced review); with several courses, interleave them and give the nearest exam more weight in its final week.
   **Past exams go oldest first, most recent last.** Whenever the plan uses real past exams — catalog questions in the practice phase, whole exams solved or taken as mock exams in the final stretch — order them by date, oldest earliest, so the most recent exams (the best picture of the current exam's style and difficulty) are the last ones done, untouched until the final stretch. Don't spend a recent exam's questions on early topic practice when older ones cover the topic.

7. **Fill each day with concrete tasks**, each with its duration and, where a skill does it, the skill: `ENGCIA summary — Bayes section (pp. 12–20)`, `Solve N23-P3 and R21-P2 — solve-exam in hints mode if stuck`, `Quiz on Bayes — quiz`, `Mock exam 1 under exam conditions — mock-exam`, then `Mark it — correct-attempt`. Respect the session shape from step 3 (block length, tasks per day). When material a task needs doesn't exist yet (no summary, no flashcards), schedule making it first (`study-summary`, `flashcards`).

8. **Show the plan's outline and wait for a yes**: the study style you understood, hours per course and per topic, the phase dates, the mock exam days, the buffer, and anything that didn't fit.

9. **Write the plan** following `templates/plan.md` — frontmatter (exams, availability, study style, version), an overview (hours per course and per topic), then one section per week with a table (day, hours, focus) and one `### YYYY-MM-DD · weekday · N h` heading per day with its tasks as `- [ ]` checkboxes and durations. Keep that heading and task format: `make_ics.py` and replanning read it.

10. **Save it where the KB says** — the study purpose folder, found as `../../references/study-folder.md` describes: `outputs/<area>/<study>/<plan>-<scope>/` for one course, or the general area's study folder (e.g. `outputs/geral/estudo/`) when the plan covers several, with names in the KB's language (`plano-<scope>`; scope = the course, or the season, e.g. `plano-epoca-normal-2026-27`). Versioned like summaries: the name never changes, `version`/`updated` in the frontmatter, no changelog. The plan is the `.md` only — don't render a Word or PDF. Add or update one short row in the index table of `outputs/README.md`.

11. **Delivery — ask first, always the same three options.** Ask with `AskUserQuestion` where the plan should go:
    - **Calendar** — the events are created directly in the user's calendar through a calendar connector (Google Calendar, Outlook…). Offered only when a connector that creates events is available in this session; otherwise say it isn't and offer the other two.
    - **`.ics`** — write a file to import into any calendar.
    - **Neither** — nothing is created; the markdown plan is all there is.
    Pick nothing by default and write no `.ics` unless the user chose it. For the first two, also ask whether study blocks are all-day events or start at a set time (e.g. 18:00).
    - **`.ics`**: `python <plugin>/scripts/make_ics.py <plan.md> [--start HH:MM]` writes `<plan>.ics` next to the plan (one event per study day with its tasks in the description, one per exam).
    - **Calendar connector**: `python <plugin>/scripts/make_ics.py <plan.md> --json [--start HH:MM]` prints the same events. Show how many would be created and three examples, and only after a yes create them one by one with the connector, in the calendar the user chooses. Report what was created; if some failed, say which. Never delete or change existing events. When updating the plan after events were created, ask before creating the new ones, and remind the user that the old ones are still there.

12. **Notion — offer it as an extra.** Independent of step 11: if a Notion connector is available in this session, ask with `AskUserQuestion` whether to also put the plan in Notion (yes / no); never assume it.
    - **Which page.** Look for `notion_plans_parent` under a `## Study settings` section in the KB's `KB_GUIDE.md`. If it is there, confirm it ("Ponho em <title>?") instead of asking from scratch. If it isn't, ask the user where the plan should go: a link to a Notion page, or a name to search for in Notion (search, show the best matches, let the user choose). Once the page is known, ask whether to **remember it**, and on a yes add `notion_plans_parent: <page url>` under `## Study settings` in `KB_GUIDE.md` (creating the section at the end if needed), so next plans don't ask again. `KB_GUIDE.md` is the only KB file touched, and only with that line.
    - **The Notion page decides the format.** Before creating anything, fetch the parent page and read what it says: instructions written in it, a template, the structure and properties of a database, example child pages, naming conventions, an order of sections. Follow them over this skill's default layout (except that tasks stay checkboxes) — title pattern, properties to fill, template to start from, where the to-dos go, how days and weeks are grouped. Only where the page says nothing, fall back to the default: one child page titled like the plan (`Plano de estudo — <scope>`) with the same content as the markdown (overview, then each week and each day with its tasks as Notion to-do items) and the Notion connector's own page-format instructions. If the page's instructions conflict with what the plan needs (e.g. no room for per-day tasks), say so and ask rather than dropping content.
    - **Confirm before creating.** Show the user the parent page, the title and the structure you will follow (and which template or properties it comes from), and wait for a yes.
    - **Remember the page** in the plan's frontmatter as `notion_page: <url>` so the update mode (below) edits that page in place instead of creating another one. The markdown plan stays the source of truth for dates and structure; in Notion only the checkboxes are expected to change.
    - Never delete Notion pages or change anything outside the plan's page.

13. **Report**: the files written, hours per course, the mock exam dates, what didn't fit, the calendar outcome (calendar / `.ics` / none) and whether Notion got a page. Before reporting, if the KB has a dashboard, add the plan to the dashboard's `settings.json` → `plans` (`{"path": "outputs/…/<plan>.md", "label": "<title>"}`) if it isn't there yet, write each course's exam dates into its `course.json` as [`references/dashboard.md`](../../references/dashboard.md) says, and log the run (`event study-plan "Plano até <last exam>"`).

## What do I have today?

Read the latest plan for the course(s), find today's heading, and answer in the chat with today's unchecked tasks (and any unchecked ones from past days). Don't write anything.

## Update

For "atualiza o plano", "não fiz X", "fiz mais do que estava previsto", "estou atrasado", "replaneia", or a change of exam date or availability. The user tells what happened in plain words; the plan adjusts.

1. **Find the current state.** Read the latest plan for the course(s). If it has a `notion_page` and a Notion connector is available in this session, fetch that page too and merge its ticked checkboxes into what you know (a task ticked in either place is done); without a connector, carry on from the markdown plan and say in the report that the Notion state was not refreshed (and, at the delivery step, that the Notion page can't be updated now). Re-read the progress record: states may have changed since.
2. **Ask what changed, only for what isn't already clear.** Let the user say it freely and read it from there: tasks not done, tasks done that weren't planned (a mock exam taken early, a whole extra topic), days lost, a change in availability or exam dates. Match what they say to the plan's tasks and show the match back in one short list before changing anything ("marco como feito: …; passo para a frente: …") so a misreading is caught.
3. **Adjust, from today to the exams:**
   - tasks done are marked `- [x]` where they were planned, and extra work done is added to the day it happened, with its duration;
   - work that was ahead of schedule is taken off the days it was planned for, and the freed time goes to the next weak topic or to the buffer;
   - tasks not done are moved to the next days that have free hours (buffer first), keeping the order the plan had (past exams oldest first, mock exams under exam conditions in the final stretch); if there is no room, say what doesn't fit and propose what to cut (📎 topics already 🟢 first), as in step 5 — don't cram;
   - past days stay as they were, with what was really done checked.
4. **Show what changed** — a short before/after (which tasks moved where, what was cut, hours still free) — and wait for a yes.
5. **Write the next version** of the same plan (same file, `version` and `updated` bumped, no changelog), then offer the delivery again: `.ics` and calendar (step 11 — the old events are still there, so say it), and Notion (step 12) by **updating the existing `notion_page` in place** instead of creating a new page, and asking before doing it. If the KB has a dashboard, update the courses' `course.json` if exam dates changed, and log the update as [`references/dashboard.md`](../../references/dashboard.md) says (`event study-plan "Plano atualizado: N tarefas feitas"`). The page reads the ticks from the plan itself.

## Notes

- Never promote a plan into the wiki.
- A day with no available hours gets no tasks; don't move work onto days off.
