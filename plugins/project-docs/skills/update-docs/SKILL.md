---
name: update-docs
description: "Bring a project's documentation back in line with the code after a change — updating only the sections the change actually touched, from a named module/feature or from the current branch's diff against its base, and logging what moved in the documentation changelog when there is one. It reads each section before editing it, never blind-overwrites, never regenerates a whole file to fix one line, and never invents a fact the diff does not support. Works in any project and any stack: it discovers the documentation layout instead of assuming one. Use whenever documentation needs to catch up with recent work — e.g. 'atualiza a documentação', 'sincroniza os docs com estas alterações', 'atualiza os docs da API', 'update the docs for this feature', 'sync docs with my changes', 'the ER diagram is out of date'."
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

# Update docs

Documentation rots quietly. This skill moves only what the diff proves has moved, and says so in the changelog — so the next person can tell what was checked from what was merely left alone.

It works on any documentation tree, including one built by `docs-tree`. Write every `.md` you touch without hard line breaks: one paragraph, list item or table row per line.

## Phase 0 — Project conventions

If the repository has a `CLAUDE.md`, an `AGENTS.md` or a `CONTRIBUTING.md`, read it once. Write in the language the documentation already uses.

## Phase 1 — Scope

Two modes:

**Named scope** — the user names a module, feature or area. Scope is the files belonging to it.

**Diff mode** (the default) —

```bash
git status --short
git diff <base>...HEAD --name-only
```

Use the repository's real base branch, from its branching docs or `git branch -r`. Compare against `origin/<base>`, not a stale local copy. Ask if it is unclear.

If the scope is empty, say so and stop. Do not touch a single documentation file to prove you ran.

## Phase 2 — Map the change to its documentation

Discover the documentation layout first (`Glob` for `docs/**/*.md`, `doc/`, `wiki/`, the README's links), then decide what the diff hits. The mapping below is the usual shape; adapt it to the project you are actually in, and skip rows for things the project does not have.

| What changed in the diff | What it probably invalidates |
| :--- | :--- |
| Controllers, route handlers, request/response types, CLI commands, public exports | The API or public-surface page, and a sequence diagram if a flow changed |
| Migrations, schema files, ORM mappings | The data-model page and the ER diagram |
| New FK, new external integration, new scheduled job moving data | The data-lineage page |
| Auth, permissions, secrets handling, error contract | The security page |
| Build, pipeline, environment or deploy config | The operations pages and the environment table |
| Setup steps, scripts, tool versions | The onboarding and run-locally pages, and the README's getting-started |
| Only tests, formatting or comments | Nothing. Say so |

One change can hit several rows. Update every row it hits, and none that it doesn't.

## Phase 3 — Edit narrowly

1. `Read` the section before you touch it.
2. `Edit` only the paragraphs, rows or diagram fragments the change actually invalidates. Leave everything else exactly as it is, unrelated `TODO`s included.
3. Every new fact cites a real path from the diff, verified — never a remembered one. Cite paths and symbols, never line numbers.
4. For a Mermaid (or other) diagram, edit the block that changed. Do not regenerate the file.
5. **Re-check any count you touch by measuring it**, never by adjusting the old number. If a page says "about 60 tables", count them; round numbers in documentation are usually stale numbers.
6. **If the change was a bug fix, check whether the documentation describes the bug as if it were the design.** This is the most common rot: a diagram drawn from code that was wrong. Fixing the code does not fix the drawing.
7. Leave out of scope anything the project's own rules assign to another process — change records (`implement-change`), fix ledgers, decision records (`create-adr`). Read the documentation index to learn which those are.
8. If a section needs a fact the diff does not give you, write a `TODO:` naming what is missing and who can answer it. Never infer.

## Phase 4 — Changelog

If the documentation keeps a changelog, append one entry to its unreleased section, naming the sections you updated and the files that forced it. If nothing needed updating, still add a line saying the diff was reviewed and found not to affect the documentation — a silent skip is indistinguishable from a skill that never ran.

If it keeps none, say so in the report and offer to start one; don't create it unasked.

## Phase 5 — Report

List every file edited, or state plainly that none needed it, and show the changelog entry.

**Do not run `git add` or `git commit`.** `commit-push` does that.
