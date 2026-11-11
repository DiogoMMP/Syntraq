---
name: wiki-lint
description: Health-check the compiled wiki/ of a knowledge base — broken internal links, articles orphaned from wiki/index.md, stale references to files/decisions that no longer exist, and dangling manifest entries. Reports findings and asks before fixing anything. Use when the user wants to lint, clean up, audit, or check the health/consistency of their wiki.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(mkdir *), Bash(mv *), AskUserQuestion
---

# Wiki lint

The "lint" step from Karpathy's [LLM Knowledge Bases](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) note: periodically sweep the wiki for inconsistencies instead of letting them accumulate silently. Reports first, fixes only what the user approves.

## Steps

1. **Find the knowledge base.** Same discovery as `compile-wiki`: look for `wiki/` next to `KB_GUIDE.md` nearby, ask if not found or ambiguous. Read the frontmatter for `mode`.

2. **Check for broken internal links.** Grep every `.md` file under `wiki/` (excluding `wiki/_geral/`, which belongs to another vault) for `[[Article Name]]` wikilinks and relative markdown links. For each, verify the target exists — as a `.md` file somewhere under `wiki/` (including `wiki/_geral/` for links that intentionally point there) for wikilinks, or as a real path for relative links. Ignore anything inside inline code (`` `…` ``) or fenced code blocks — a Prolog list like `[[a,b]]` or a code sample is not a link. Flag anything that doesn't resolve.

3. **Check for orphaned articles.** List every article under `wiki/` (excluding `index.md`, `Estrutura.md`, `sources.md`, `README.md`, and anything under `_geral/`). Flag any that aren't linked from `wiki/index.md` or from any other article — they exist but nothing points to them.

4. **Check that the areas follow `raw/`** (research mode). Compare the top-level folders of `raw/` (it has no rules, so only as a hint) with the areas of `wiki/`, `notes/` and `outputs/`: an area that exists in only one of the three trees, a `wiki/` area with no source left in `raw/`, or `raw/` folders with no area at all. A mismatch usually means `raw/` was reorganised — report it and suggest running `compile-wiki`, whose restructuring step moves the three trees together; don't move anything here.

5. **Check for dangling manifest entries.**
   - Research mode: rows in `wiki/sources.md` whose listed article(s) no longer exist, or whose source file is gone from `raw/`. A row may name several files, a folder, or a glob (`src/**`, `{a,b}/*.md`): check each named path, and flag a glob only when it matches nothing. Watch for commas that belong to a folder or file name rather than separating files — when a path only resolves with the comma kept, it is one path. Don't report a row as missing on a parsing doubt; say it couldn't be checked.
   - Both modes: compiled notes whose listed `articles:` no longer exist, and (research mode) notes whose `source:` points to a `raw/` file that doesn't exist.

   **Notes in the wrong place** (both modes). The top level of `notes/` is the inbox and its subfolders are the archive (see `notes/README.md`). Flag notes at the top level that already say `status: compiled` (older KBs, or a move that didn't happen) — the fix is moving each to the area of its `articles:` and updating the wiki links that cite it — and notes inside a subfolder that aren't `status: compiled` (they would never be picked up).

   **Outputs** (research mode; skip what doesn't apply if `outputs/README.md` predates this layout):
   - Files under `outputs/` with no row in the index table, and rows pointing to a file that no longer exists. A folder indexed as a whole counts as one entry and covers every file inside it: a `work/<name>/` folder, and each regenerated output that its purpose folder keeps in a folder of its own (e.g. a summary, an exam sheet, a mock exam, a flashcard deck), and any folder that `outputs/README.md` says is indexed as a whole.
   - Outputs outside the layout in `outputs/README.md`: loose files directly in `outputs/` or `outputs/<area>/` instead of one of the purpose folders registered in `outputs/README.md` (or `work/`), purpose folders in use but missing from that registry, or an `<area>` the wiki doesn't have.
   - `work/<name>/` folders without a `README.md`, or whose README doesn't list every `vN/`.
   - Index rows whose "what for" is more than one short sentence, or whose status isn't one of the statuses `outputs/README.md` lists (in the KB's language, e.g. `rascunho`, `final`, `promovido →` in `pt-PT`) — the detail belongs in the output itself.
   - `.md` outputs without the frontmatter that says what they're based on.

6. **Check for duplication between `outputs/` and `wiki/`** (research mode). The wiki is the single source of truth, so flag:
   - Wiki articles that point to an output as a stand-in for content ("a análise está em outputs/…") instead of containing that knowledge.
   - Outputs whose content largely restates a wiki article (same headings, same tables, the same facts) rather than linking to it — and outputs marked as promoted whose content was pasted whole into the wiki instead of only the new parts. Outputs that `outputs/README.md` marks as made to be printed and studied from (summaries, exam sheets…) are the exception: they are meant to be printed and do contain the material, so only flag it if it was promoted into the wiki whole. This is a judgment call, not a mechanical match: report candidates with the overlapping passages, and propose the fix (move the knowledge into the article and trim the output to its purpose, or replace the repeated part with a link) — never delete or merge on your own.

7. **Check for stale references (code mode).** For articles that cite a file path (e.g. in backticks), spot-check whether that path still exists in the repo (`Glob`). Treat this as a low-confidence heuristic, not a hard rule — code moves around legitimately — and flag candidates rather than asserting they're wrong.

8. **Report findings** as a clear list grouped by category, even if some categories are empty. Don't touch anything yet.

9. **Ask the user which fixes to apply**, e.g.: relink or remove broken links, link orphaned articles into `wiki/index.md` (or confirm they should stay unlinked / be deleted), fix or remove dangling manifest rows, move misplaced notes to their archive folder (relinking the wiki), move or index misplaced outputs, shorten index rows, resolve duplication by moving the knowledge into the wiki and trimming the output, and note stale-reference candidates for the user to confirm before touching the article text. Moves are shown as a full from → to list first.

10. **Apply only the approved fixes**, then report what changed.

## Notes

- Never delete an article without explicit confirmation — orphaned isn't the same as wrong, it might just be missing a link from `index.md`.
- Never touch `raw/` and never flag its structure — it has no rules to break.
- Never touch `wiki/_geral/` — it's a directory link into another vault, maintained by its own `compile-wiki`/`wiki-lint` run.
- This complements `compile-wiki`, it doesn't replace it: run this periodically for upkeep, not as part of every compile.
