---
name: flashcards
description: Make Anki flashcards for a course inside a research knowledge base created by the knowledge-base skill — atomic basic and cloze cards from the wiki and the exact wording in raw/, weighted towards what comes up in the exams and the user's weak spots, each with its source and tags (course, topic, exam band, weak), exported as Anki's tab-separated text import (no install) or an .apkg with images. Cards keep stable ids, so re-importing a new version updates them in Anki instead of duplicating them and the review history is kept. Use when the user wants flashcards, Anki cards or spaced-repetition material — e.g. "faz flashcards de ENGCIA", "cria cartões para o Anki", "flashcards dos meus pontos fracos", "make Anki cards".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(find *), Bash(python *), Bash(py *), Bash(python -m pip install genanki), AskUserQuestion
---

# Flashcards

Turns the course into cards worth reviewing every day: one fact each, grounded in the KB, more of them where the exams and the user's weak spots are. The `.md` source is the deck; the Anki file is generated from it by the plugin's `scripts/anki_export.py`.

## Ground rules

- **Markdown without hard wraps.** Every `.md` this skill writes has one paragraph, list item or table row per line, however long — never broken at 80/100 columns; the viewer wraps lines. Line breaks only between blocks and inside code blocks (and, in flashcard decks, inside a card, where a line break is part of the card).
- **One fact per card.** No "list the seven characteristics" cards — when a list matters, each item becomes a cloze. No trivia nobody is asked about.
- **Grounded in the KB.** Every card comes from the wiki or `raw/` — exact formulas and definitions as the slides give them — and its back ends with the source (article, slide/page).
- **Stable ids.** A card keeps its id across versions; that id is the note's GUID in Anki, which is what makes re-importing update cards instead of duplicating them.
- **`raw/` has no rules and is never written to.** Don't assume the KB is a git repository.
- **The KB's language** for the cards; technical terms stay as-is. The template is in English — translate its prose, keep the card markers and frontmatter keys as they are.

## Steps

1. **Find the knowledge base and the course** — same discovery as `exam-map`.

2. **Agree the options.** Use what the user said; ask only for what's missing:

   | Option | Values | Default |
   | --- | --- | --- |
   | Scope | whole course, a block, chosen topics, my weak spots (🔴/🟡 of the progress record) | whole course |
   | How many | in proportion to exam weight — about 30 cards for a 🔥 topic, 15 for ⚠️, 5 for 📎 — or a fixed total | in proportion |
   | Format | `.txt` (Anki text import, no install, no images) or `.apkg` (with images; needs `genanki` — ask before `python -m pip install genanki`) | `.txt` |

   For `.txt`, the note types are referred to by name, and Anki names its stock types in the language it was installed in. Ask once which names the user's Anki shows for the basic and the cloze note types (e.g. "Basic"/"Cloze", or "Básico"/"Omissão de palavras" in Portuguese) and record them as `anki_basic`/`anki_cloze` in the deck's frontmatter; an `.apkg` brings its own note types and doesn't need this.

3. **Gather the material.** The wiki articles in scope, `raw/` for exact wording and formulas, the exams article for each topic's band and weight, the question catalog for what is actually asked, and the progress record (if any) for weak spots and recurring mistakes — a recurring mistake is a card.

4. **Design the cards.**
   - **basic**: a definition, a "why?", the difference between two concepts, the next step of a method, what a piece of code does;
   - **cloze**: formulas, rules, syntax and the items of a list that matters (`{{c1::insertLogical}} keeps a fact only while …`). Inside a formula, never let the cloze's `}}` touch a LaTeX `}` — Anki would close the cloze early: write `{ {{c1::x}} }` with spaces, or put the cloze around the whole `$…$`.
   - Tags on every card: the course, the topic, the exam band as `exam::frequent` / `exam::regular` / `exam::rare` (🔥/⚠️/📎 — written in the KB's language), and `weak` when the topic is 🔴/🟡 in the progress record.

5. **Show before writing them all**: the number of cards per topic (and basic/cloze split) and five sample cards. Write the rest after a yes.

6. **Write the deck source** following `templates/deck.md`: frontmatter (deck name `<KB topic>::<course>`, note type names, version), then one section per topic with its cards as `<!-- card id=… type=basic|cloze tags="…" -->` … `---` … `<!-- /card -->` blocks — front above the `---`, back (or the cloze's back extra) below, the source on the back's last line. Ids are `<course>-NNNN`, never reused.

7. **Save it where the KB says** — the study purpose folder, found as `../../references/study-folder.md` describes:
   ```
   outputs/<area>/<study>/flashcards-<scope>/
   ├── flashcards-<scope>.md     the deck source
   └── flashcards-<scope>.txt    for Anki (or .apkg)
   ```
   with `<scope>` a short slug as for summaries (the course for the whole course). Versioned like summaries: the name never changes, `version`/`updated` in the frontmatter, no changelog. **Regenerating** an existing deck: keep the id of every card that stays (even if its wording improves), give new cards new ids, and for each card that goes keep its block with the extra tag `removed` (in the KB's language) — Anki import never deletes notes, so the user deletes that tag's cards in Anki; drop those blocks in the version after.

8. **Export**: `python <plugin>/scripts/anki_export.py <deck.md>` (add `--apkg` for the package; the plugin's `scripts/` folder is two levels above this skill). Exit code 2 means the deck source is malformed — fix the reported card; 5 means genanki is missing.

9. **Index it.** One short row in the index table of `outputs/README.md` (type: flashcards, what for: one sentence, status: the KB's word for *final*, as listed in `outputs/README.md` — e.g. `final` in `pt-PT`), or update its date and version.

10. **Report**: the cards per topic, how to import (Anki → File → Import → the file; the header lines set the deck, note types, tags and ids), and the cards tagged as removed, if any.

## Notes

- Images only go in an `.apkg`; with `.txt` the exporter warns about cards that have them — leave the figure out or switch format.
- Never promote cards into the wiki. A card that needed something the wiki lacks is worth a note — offer to capture it.
