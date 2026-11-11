---
name: knowledge-base
description: Scaffold a personal LLM-driven knowledge base — either a Karpathy-style research KB (raw/ sources + compiled wiki/) or a lighter code-repo KB (wiki/ fed by notes/ + git history), optionally linked to a shared general vault. Use when the user wants to set up a new wiki/knowledge-base project, a decision log for a personal code repo, or mentions building a personal knowledge base with Obsidian.
allowed-tools: Write, Read, Bash(mkdir *), Bash(ln -s *), Bash(cmd /c mklink *), PowerShell(New-Item *), PowerShell(Test-Path *), AskUserQuestion
---

# Knowledge Base scaffolding

Sets up a personal knowledge base wiki, in one of two modes:

- **research** — Andrej Karpathy's ["LLM Knowledge Bases"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) setup: heterogeneous external sources land in `raw/`, an LLM incrementally compiles them into `wiki/`, with your own commentary in `notes/`. Good when there's a real body of external material to ingest (papers, articles, datasets, repos).
- **code** — lighter setup for a personal code repo: no `raw/`. The wiki is built directly from your own scratch notes (`notes/`) and the repo's git history via the `compile-wiki` skill. Good when you *are* the source material and just want decisions/context to survive past your own memory, without team-knowledge-sharing overhead you don't need.

In both modes, `wiki/` is meant to be edited by the LLM, not by hand — Obsidian (or any markdown viewer) is just the frontend for viewing it.

## Steps

1. **Ask which mode.** Ask the user: research-style KB (raw/ + wiki/) or code-repo KB (wiki/ + notes/, no raw/)? Don't guess — the two produce different structures and `KB_GUIDE.md` content.

2. **Ask where to create it.** Ask which directory the knowledge base should be created in. Offer sensible options: the current directory, or a new subdirectory (ask for its name — suggest one derived from the topic if the user has mentioned one). Always confirm the target path before creating anything.

3. **Ask for a topic/title** if it isn't already obvious from the conversation (e.g. "AI safety research", "this repo's name"). Used as the title in `wiki/index.md` and `KB_GUIDE.md`. A generic placeholder is fine if the user has no topic yet.

   Also ask **which language the wiki should be written in** (e.g. `pt-PT`, `en`) — don't default silently. Record it as `language:` in `KB_GUIDE.md`'s frontmatter (replacing `{{LANGUAGE}}`); `compile-wiki` reads it instead of guessing. Technical terms stay in their original language regardless.

4. **Research mode only: ask how `raw/` will hold source material.** Don't guess — it changes whether `raw/` ends up as a real folder, a link, or both:

   - **Guardado diretamente** — files get copied/dropped into `raw/` as-is, kept inside this KB, exactly like Karpathy's original design.
   - **Link para uma pasta existente** — the material already lives elsewhere (a synced Drive folder, another repo, a folder you keep organizing outside git) and `raw/` should point at it instead of duplicating it. Ask for that folder's path.
   - **Os dois** — `raw/` is a real folder for anything added directly, plus one or more named subfolders that are links to existing external folders. Ask for each external folder's path and a short name to link it under (e.g. `raw/faculdade` → `D:\Faculdade\MEIA`).

   Skip this step entirely in code mode — there's no `raw/` there.

5. **Create the structure** under the target directory, branching on mode:

   **research mode:**

   ```
   <target>/
   ├── raw/
   │   └── README.md
   ├── notes/
   │   └── README.md
   ├── wiki/
   │   ├── README.md
   │   ├── index.md
   │   └── sources.md
   ├── outputs/
   │   └── README.md
   ├── tools/
   │   └── README.md
   ├── AGENTS.md          (step 8)
   └── KB_GUIDE.md
   ```

   - `raw/`, depending on the answer to step 4:
     - *Guardado diretamente*: create it as a real folder and copy `templates/raw-README.md` → `<target>/raw/README.md`, exactly as before.
     - *Link*: create `raw/` itself as a directory link to the given external folder — skip copying `raw-README.md`, there's nothing to explain inside a folder this KB doesn't own.
       - **Windows**: `New-Item -ItemType Junction -Path "<target>\raw" -Target "<external>"` (PowerShell), or `cmd /c mklink /J "<target>\raw" "<external>"` (via Bash).
       - **macOS/Linux**: `ln -s "<external>" "<target>/raw"`. Then list `raw/` to verify the link resolves — if it errors or comes back empty when the external folder isn't, remove the broken link and tell the user the path is wrong; don't report success.
     - *Os dois*: create `raw/` as a real folder with `templates/raw-README.md` copied in, then for each external folder from step 4 create a named link inside it the same way (e.g. `raw/<name>` → `<external>`), verifying each link the same way. Either way, once `raw/` involves a link, append a short note to `KB_GUIDE.md` (after copying it below) recording the external path(s) and that they're read-only from this KB's point of view — mirroring the note added for `wiki/_geral` in step 7. Don't assume `<target>` is a git repository, and never create a `.gitignore` here. Only if `<target>` already is inside one, mention that the linked folder(s) would be picked up by git unless ignored, and offer to add the `.gitignore` lines — write them only on a yes.
   - Copy `templates/research-notes-README.md` → `<target>/notes/README.md` (not the code-mode `notes-README.md`: research notes are thoughts, decisions, questions, AI answers and messages from other people, with optional `kind`/`from`/`source` frontmatter). `notes/` is always a real folder in this KB, even when `raw/` is a link: it's where your own notes live, next to (never inside) the external material.
   - Copy `templates/sources.md` → `<target>/wiki/sources.md`, so the manifest exists from the start.
   - Copy `templates/wiki-README.md` → `<target>/wiki/README.md`
   - Copy `templates/wiki-index.md` → `<target>/wiki/index.md`, replacing `{{TOPIC}}` and `{{DATE}}`
   - Copy `templates/outputs-README.md` → `<target>/outputs/README.md` (it explains the `outputs/<area>/<purpose>/` layout, the registry of purpose folders and the short index table; don't pre-create any area or purpose folder — skills and people create and register them when the first output needs them)
   - Copy `templates/tools-README.md` → `<target>/tools/README.md`
   - Copy `templates/KB_GUIDE.md` → `<target>/KB_GUIDE.md`, replacing `{{TOPIC}}`, `{{LANGUAGE}}` and `{{DATE}}` (this template's frontmatter sets `mode: research`)

   **code mode:**

   ```
   <target>/
   ├── wiki/
   │   ├── README.md
   │   └── index.md
   ├── notes/
   │   └── README.md
   ├── AGENTS.md          (step 8)
   └── KB_GUIDE.md
   ```

   - Copy `templates/code-wiki-README.md` → `<target>/wiki/README.md`
   - Copy `templates/code-wiki-index.md` → `<target>/wiki/index.md`, replacing `{{TOPIC}}` and `{{DATE}}`
   - Copy `templates/notes-README.md` → `<target>/notes/README.md`
   - Copy `templates/code-KB_GUIDE.md` → `<target>/KB_GUIDE.md`, replacing `{{TOPIC}}`, `{{LANGUAGE}}` and `{{DATE}}` (this template's frontmatter sets `mode: code` and leaves `last_compiled_at` and `domain_model` empty — `compile-wiki` fills in the former on its first run)

   Either way:
   - **Write every copied template in the KB's language** from step 3 — `KB_GUIDE.md`, every `README.md`, `wiki/index.md` and the headers of `wiki/sources.md` — not only `AGENTS.md`. Translate the names of the `general/` folder, the `work/` folder and the output statuses too, and use those translated names consistently in every file (e.g. for `pt-PT`: `geral/`, `trabalho/`; `rascunho`, `final`, `promovido →`). The other `outputs/` purpose folders have no fixed names here: whichever skill first needs one names it in the KB's language and registers it in `outputs/README.md`, and everyone else reuses the registered name. Frontmatter keys and `kind:` values (`thought`, `decision`, `question`, `ai-response`, `message`) stay in English — skills read them.
   - Don't create a `.gitignore` unasked — the KB may well not be a git repository at all (see the one offer in step 5 for a linked `raw/`).

6. **Code mode only: ask about a domain model.** Ask the user whether the project has a domain model worth documenting (e.g. DDD entities, an ORM schema, an ER diagram, a class diagram). If yes, ask where it lives — a path to the entity/model files or folder, or a diagram file — or a short description if there's nothing to point at yet. Record whatever they give you in `KB_GUIDE.md`'s `domain_model` frontmatter field (a path, list of paths, or free text; leave it empty if they say no). This only needs asking once — `compile-wiki` reads it on every run to keep the structure overview current. Skip this step entirely in research mode.

7. **Ask about linking to a general/shared vault.** Ask the user whether this KB should link into a general/shared Obsidian vault, so both show up in the same graph. If they decline or don't have one, skip to step 8.

   If they want a link:
   - Ask for the path to the general vault.
   - If nothing exists at that path yet, offer to bootstrap it first by running steps 1–5 of this same skill against that path (topic: something like "Geral" or whatever the user calls it — research or code mode, whichever fits how they'll use it). Confirm with the user before creating it.
   - Verify the general vault has a `wiki/` directory, then create a directory link named `_geral` inside the project's `wiki/`, pointing at the general vault's `wiki/`:
     - **Windows**: `cmd /c mklink /J "<target>\wiki\_geral" "<general-vault>\wiki"` (via Bash), or `New-Item -ItemType Junction -Path "<target>\wiki\_geral" -Target "<general-vault>\wiki"` (via PowerShell). Junctions don't need Developer Mode or admin rights, unlike symlinks.
     - **macOS/Linux**: `ln -s "<general-vault>/wiki" "<target>/wiki/_geral"`.
   - Confirm the link resolves (list `<target>/wiki/_geral` and check it shows the general vault's contents) before reporting success.
   - Append a short note to the project's `KB_GUIDE.md` recording that `wiki/_geral/` is a linked, read-only reference into the general vault — content there is maintained by the general vault's own compile step, never written to from this project.

8. **Write the agent-instructions file.** `KB_GUIDE.md` only helps an AI that already knows the KB exists; `AGENTS.md` (the cross-tool standard, which Claude Code also reads as a fallback when there is no `CLAUDE.md`) is what makes any AI use it. It must be written at `<target>/AGENTS.md` — or the repo root if `<target>` is a subfolder of a git repo whose root differs, since that's where tools look; confirm the location if it's ambiguous.

   - Take the block from `templates/AGENTS.md` (research) or `templates/code-AGENTS.md` (code), replacing `{{TOPIC}}`, and **translate the prose into the wiki language** chosen in step 3. The block is delimited by `<!-- kb:start -->` / `<!-- kb:end -->`.
   - **Never overwrite an existing file.** If `AGENTS.md` already exists, append the block (or replace only what's between its own `kb:start`/`kb:end` markers if present). If the repo has a `CLAUDE.md` and no `AGENTS.md`, Claude Code would ignore a new `AGENTS.md`, so ask whether to add an `@AGENTS.md` import line to `CLAUDE.md` (and do so only on a yes).
   - Show the user the final block before writing it.

9. **Report back**: show the resulting tree, briefly explain each folder for the mode chosen, and point at `KB_GUIDE.md` for the full workflow and `AGENTS.md` as what tells AI tools to ground answers in the wiki. If a general-vault link was created, mention it too. In code mode, mention that the first `compile-wiki` run will generate `wiki/Estrutura.md`, a structure overview kept fresh on every run.

## Notes

- Never write directly into `wiki/` as "the answer" to a one-off question. In research mode that's what `outputs/` is for. The wiki is the single source of truth: outputs link to it rather than repeat it, and promoting an output folds only what the wiki doesn't already say. Code mode has no `outputs/` — there's no one-off Q&A rendering step, so this mostly doesn't come up.
- Keep source material read-only in spirit: `raw/` (research mode) is never edited by the LLM; `notes/` (both modes) has its frontmatter status updated by `compile-wiki`, which then moves the note into its archive folder, but its written content is never rewritten. In research mode `notes/` is the one place for the user's own content, so it stays a real folder even when `raw/` is a link.
- When `raw/` (or a subfolder of it) is a link rather than a real folder, that's doubly true: never write into it, not even a `README.md` — it's someone else's folder, this KB just reads through it.
- `wiki/_geral/` (when linked) is likewise read-only from this project's point of view: it's a directory link, not a copy, so edits made there would actually land in the general vault.
