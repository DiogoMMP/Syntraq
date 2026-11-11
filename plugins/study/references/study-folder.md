# The study purpose folder

Every study skill writes into one purpose folder of `outputs/<area>/`. The knowledge-base plugin doesn't fix its name — it is registered in the KB, in the KB's language — so never hardcode it (`study`, `estudo`…).

## Finding it

1. Read the registry table in `outputs/README.md` (its "Folder | What goes in it" table) and look for the row about study material: summaries, exam sheets, mock exams, solved exams, flashcards, plans, progress records.
2. If there is one, use that name exactly, for every skill of this plugin.
3. If there is none, name the folder in the KB's language (`language:` in `KB_GUIDE.md`; e.g. `study` in English, `estudo` in `pt-PT`), create it when the first output is written, and add a row to the registry saying what it holds and that its contents are made to be printed and studied from, so they may contain the material (they are still never promoted into the wiki as a whole). Tell the user the name you registered.

The names of the folders inside it (`summary-<scope>`, `sheet-<scope>`, `mock-…`, `progress-<course>`…) are also written in the KB's language and, once used, reused as they are.

## Outputs in this folder

- Each piece is its own folder named by what it covers, without a date; the name never changes and the files always hold the latest version, with the version and date printed on the document.
- One row per piece in the index table of `outputs/README.md`.
