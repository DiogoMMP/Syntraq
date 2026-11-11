---
mode: research
topic: {{TOPIC}}
language: {{LANGUAGE}}
created: {{DATE}}
---

# Knowledge Base guide — {{TOPIC}}

Conventions for any LLM session working in this directory. Adapted from Andrej Karpathy's ["LLM Knowledge Bases"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## Layout

```
raw/                      source material, any structure
notes/
├── *.md                  pending notes (the inbox)
└── <area>/*.md           compiled notes, moved here by compile-wiki
wiki/<area>/…             the compiled knowledge — the single source of truth
outputs/<area>/
├── <purpose>/            one folder per purpose, created and registered in outputs/README.md by whoever first needs it
└── work/<name>/          work that evolves in versions: README.md + v1/, v2/, …
tools/                    scripts that operate on raw/ and wiki/
```

- `raw/` — source material (slides, PDFs, books, exams, articles, repos, datasets, images). **It has no rules**: whatever folders and file names it already has are the structure. Never edited by the LLM, never reorganised, never required to follow a convention — skills discover what each file is from its path, name and content, and ask when it's unclear.
- **Code in `raw/` is for consulting, not compiling.** If the folder contains source code (a cloned repo, scripts, a project), the LLM reads it to answer questions or check a detail, but `compile-wiki` does not turn it into wiki articles or list it in `wiki/sources.md`. Code that illustrates a concept (a snippet from the slides, a worked example) may be quoted from the article about that concept.
- `notes/` — your own material and what other people tell you, one file per note (see `notes/README.md`). Pending notes sit loose at the top of `notes/`; once `compile-wiki` folds one into the wiki it moves it to `notes/<area>/`, so what is still pending is visible at a glance.
- `wiki/` — the compiled knowledge base: `.md` files with backlinks, organised by area and concept. LLM-maintained; humans mostly just read it (e.g. in Obsidian).
- `outputs/` — artifacts generated from the KB for a purpose (see `outputs/README.md`), in the same areas as `wiki/`, split by what they are for.
- `tools/` — scripts/CLIs that operate on `raw/` and `wiki/` (search, linting, importers).

The areas (a course, a project, a topic) are the same in `wiki/`, `notes/` and `outputs/` — one taxonomy, not three. `general/` holds what fits no area. Folders are created when the first file needs them, never in advance.

The names of the four purpose folders (and of `general/`) are written in the KB's language; the tree above is the reference any skill uses to find them.

Nothing here assumes the folder is a git repository. Versions of a piece of work are kept as folders (`v1/`, `v2/`, …) with a changelog in that work's `README.md`.

## Workflow

1. **Ingest** — new source material goes into `raw/` as-is. Don't summarise or rewrite it on the way in.
2. **Note** — your thoughts, decisions, questions, answers from other AIs and messages from other people (a teacher, an expert, a colleague) go into `notes/` as one file each, with a small frontmatter (`kind`, `from`, `source`).
3. **Compile** — `compile-wiki` incrementally turns new `raw/` files and pending `notes/` into `wiki/` articles, cross-links them, keeps `wiki/index.md` and `wiki/sources.md` current, and archives each processed note into `notes/<area>/`.
4. **Q&A** — answer questions against the wiki: `wiki/index.md` plus the relevant articles; fall back to `raw/` or a live search when the wiki doesn't have the answer yet.
5. **Output** — anything produced for a purpose goes into `outputs/<area>/<purpose>/` and gets one row in the index table in `outputs/README.md`.
6. **Lint** — `wiki-lint` periodically sweeps for broken links, orphans, notes in the wrong place, outputs out of place and content duplicated between `outputs/` and `wiki/`.

## The wiki is the single source of truth

- **Knowledge goes in the wiki, and only there.** If something is durably true about an area (what a topic is, how an exam is structured, a decision that was taken), it belongs in a wiki article — not in an output that the wiki then points to.
- **Outputs never restate the wiki.** An output is a view of the wiki made for a purpose (to print, to send, to answer one question). It links to the articles it is based on instead of copying them. The one exception is study material in `study/`: it is made to be printed, so it contains the material — always derived from the wiki, one versioned folder per scope (no date in the name), and never promoted into the wiki as a whole.
- **Promoting an output** means folding into the wiki only what the wiki doesn't already say (a new fact, a worked example, a clarification) — never pasting the output whole. Then mark the output `promoted → [[Article]]` in the index.
- The wiki never says "see this output for the details" as a substitute for having the details.

## Ground rules

- Write every `.md` file without hard line breaks: one paragraph, list item or table row per line, however long. The viewer (Obsidian, GitHub) wraps lines; breaks belong only between blocks and inside code blocks.
- The wiki is written and maintained by the LLM. Humans view it, they don't hand-edit it.
- Keep `wiki/index.md` accurate — it's the entry point for every future session.
- Never write into `raw/`. Never rewrite the body of a note — `compile-wiki` only updates its frontmatter and moves it to its area.
- Versions in `outputs/<area>/work/<name>/vN/` are frozen once a newer version exists: start a new `vN/` folder instead of editing an old one.
