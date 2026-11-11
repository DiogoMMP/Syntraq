# outputs/

Artifacts generated from the knowledge base for a purpose: something to print, to send, to answer one question, or a piece of work that evolves in versions. Durable knowledge does not live here — it lives in `../wiki/`.

## Where things go

```
outputs/<area>/
├── <purpose>/      one folder per purpose, listed in the table below
└── work/<name>/    work that evolves in versions
    ├── README.md   what it is, current version, short changelog (one line per version)
    └── v1/ v2/ …   one self-contained folder per version
```

The purpose folders are **not fixed by this template**: each is created by the first skill or person that needs it, named in the KB's language, and registered here so the next one reuses it instead of inventing another name. Register a folder by adding a row to this table (which skill created it is optional):

| Folder | What goes in it |
| --- | --- |

- `<area>` is one of the areas `../wiki/` already uses (a course, a project, a topic). Don't invent a grouping the wiki doesn't have. What fits no area goes in `general/`. If the wiki has no areas, drop the `<area>/` level.
- Pick the purpose folder by what the output is **for**, not by its file type. The type (summary, chart, email, slides…) is a column in the index, not a folder.
- Inside a purpose folder, a piece of output that is regenerated over time is its own folder named by what it covers, without a date; the name never changes, the files always hold the latest version, and the version number and date are printed on the document itself. One-off output is named `YYYY-MM-DD-slug.<ext>`; a set of files that belong together (a script + the image it generates) gets its own `YYYY-MM-DD-slug/` subfolder. A skill that writes into a purpose folder says in its own instructions which of the two it uses.
- In `work/<name>/`, each version is a frozen folder: once `v3/` exists, `v2/` is not edited. The changelog lives in `work/<name>/README.md`, not in the index below.
- Create folders when the first output needs them — don't pre-create empty ones.

## Outputs never repeat the wiki

- An output is a view of the wiki made for a purpose. It links to the articles it is based on instead of copying them.
- If producing an output uncovers something durably true that the wiki doesn't say yet, put that in the wiki (through a note or `compile-wiki`), and keep only the purpose-specific part here.
- Promoting an output means folding into the wiki **only what is new** — then set its status to `promoted → [[Article]]`.
- **The exception is material made to be printed and studied from** (e.g. summaries and exam sheets): it does contain the material, but it is always derived from the wiki (and `raw/`), and is never promoted into the wiki as a whole. Anything new it surfaces goes into the wiki through a note. Whoever registers such a purpose folder says so in its row.

## What each output is based on

Not in the index — in the output itself:

- `.md` outputs start with a frontmatter block:

  ```markdown
  ---
  date: 2026-10-15
  type: summary
  based_on:
    - "[[Some Article]]"
    - raw/some/file.pdf
  status: draft
  ---
  ```

  Use `outside the KB` in `based_on` for anything that comes from general knowledge or a web search.
- A `.docx`/`.pdf` is generated from a `.md` source next to it, which carries that frontmatter.
- Anything else (an image, an HTML embed, a script) goes in its own subfolder with a short `README.md` carrying the same fields.

## Index

One row per output, added by whoever creates it and kept in sync when files move. A `work/<name>/` is one row pointing at its folder, updated when a new version is added.

- **What for** — one short sentence. Details go in the output itself.
- **Status** — `draft`, `final` or `promoted → [[Article]]`.

| Date | File | Type | What for | Status |
| --- | --- | --- | --- | --- |
