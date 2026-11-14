---
name: create-adr
description: "Create a new Architecture Decision Record (ADR) in a code repository's own ADR folder, numbered sequentially from the existing ones, generated from the project's own ADR template, and add it to whatever file holds the ADR index. Works in any project and any stack: it discovers where the ADRs live rather than assuming a path, and creates the folder and a template on the first run. Every claim in the ADR traces to something the user said or something verifiable in the repository — a missing rationale becomes a `TODO:`, never an invention. For a decision note inside a knowledge base's notes/ folder, use `adr-new` from the knowledge-base plugin instead. Use whenever the user wants an architectural decision recorded in the repo — e.g. 'cria um ADR', 'regista esta decisão', 'documenta porque escolhemos X', 'create an ADR', 'document this decision', 'add an ADR for the job scheduler'."
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

# Create ADR

An ADR records **why**, not what. The code already says what. If this document could be replaced by reading the code, it is not worth writing.

This writes into the repository (`docs/adr/` or wherever the project keeps them). A decision note for a personal knowledge base's `notes/` folder is a different job — that is `adr-new` in the `knowledge-base` plugin.

Write the ADR without hard line breaks: one paragraph, list item or table row per line, however long.

## Phase 0 — Project conventions

If the repository has a `CLAUDE.md`, an `AGENTS.md` or a `CONTRIBUTING.md`, read it once before starting. Honour its language, its heading style and its commit rules.

**Write the ADR in the language the existing ADRs use.** If there are none, use the language of the surrounding documentation, not your own default; ask only if there is neither.

## Phase 1 — Collect the decision

Prefer drafting from the conversation: if the decision was just discussed, draft the sections yourself and show them to the user to confirm or edit, rather than interrogating them field by field. Ask only for what is still unclear.

| Input | What it is | Example |
| :--- | :--- | :--- |
| **Title** | Short imperative phrase | "Use a managed queue for recurring jobs" |
| **Status** | Proposed / Accepted / Superseded by NNNN | Accepted |
| **Context** | The forces that made a decision necessary | "jobs must survive a restart and be re-runnable by an operator" |
| **Decision** | What was chosen | — |
| **Consequences** | What this buys and what it costs — **both** | — |
| **Alternatives** | What else was considered, and why it lost | — |

Do not fabricate a rationale, and do not pad "Consequences" with only the positive half — an ADR with no stated cost is a decision nobody actually weighed.

## Phase 2 — Find where ADRs live

1. `Glob` for `**/adr/*.md`, `**/adrs/*.md`, `**/decisions/*.md`, `**/architecture/decisions/*.md` and `docs/**/0*.md`.
2. If a folder is found, use it. If several, ask which.
3. If none exists, propose `docs/adr/` (or the path the project's documentation index implies) and say so before creating it.
4. Find the numbering the existing files use (usually a four-digit `NNNN` prefix) and take the highest one, ignoring any `0000-template.md`. The next number is that plus one, in the same width. If the folder is empty, start at `0001`.
5. Derive the slug from the title: lowercase, kebab-case, no filler words.

## Phase 3 — Write it

1. Read the project's template (`0000-template.md` or similar) if it exists and follow its exact section structure. If there is none, create one first, with these sections: Status, Context, Decision, Consequences, Alternatives considered.
2. Write `{NNNN}-{slug}.md`.
3. Cite real evidence — file paths, config keys, migration names — the way the existing ADRs do. Verify each one with `Read` or `Grep` before writing it down.
4. **Never cite a line number.** Line numbers move; the file path and the symbol name do not.
5. Where something is genuinely unknown, write `TODO:` and say what is needed. An honest gap is worth more than a confident guess.
6. If the new ADR replaces an earlier one, set the earlier one's status to "Superseded by NNNN" — that single line is the only edit allowed on another ADR. Touch no other part of it.

## Phase 4 — Index it

Find the file holding the ADR index — usually the documentation tree's `README.md` or an `adr/README.md`. Append one row. Do not reorder, reword or reformat the rows already there, and edit nothing else in that file.

If no index exists, say so and offer to start one, rather than inventing a place for it.

## Phase 5 — Report

Give the new file's path, its number, and the index file you updated.

**Do not run `git add` or `git commit`.** `commit-push` does that.
