---
name: docs-tree
description: "Generate a project's persistent technical documentation tree from the code itself — architecture (diagrams, decision records, data flow), technical spec (API or public surface, data model, security), development (onboarding, run locally, testing, coding standards) and operations (build, CI/CD, environments, runbooks) — plus its index and changelog. Works in any project and any stack, and adapts the structure to what the project actually has: sections it has no answer for are dropped, an existing docs layout is respected. Everything written is measured or quoted from real files, never estimated: counts are counted, negative claims record the search that produced them, and a gap becomes a dated `TODO` naming who can close it. The index carries the date the snapshot was taken, because this kind of tree rots silently. Use whenever a repository needs its technical documentation built or rebuilt — e.g. 'cria a documentação técnica', 'gera a árvore de documentação', 'documenta este projeto', 'build the docs tree', 'generate project documentation', 'document this codebase'."
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

# Documentation tree

Build a structured technical reference **from the repository**, section by section.

This skill exists because the obvious way to do this — read the code, write confident prose — produces a document that is wrong within months and wrong in ways nobody notices. Phase 3 is the part that matters; the structure is the easy half.

It documents **how the system is built and run**. It does not replace the README (the front door, see `create-readme`), the per-change records (`implement-change`), or a knowledge base (`knowledge-base`) — it links to them.

Unless the repository's markdown lint requires wrapped lines, write every `.md` file without hard line breaks: one paragraph, list item or table row per line, however long.

## Phase 0 — Conventions, language and what already exists

Read the repository's `CLAUDE.md`, `AGENTS.md`, `README.md` and `CONTRIBUTING.md` if they exist. They are normative; this tree is not. Where they disagree with what you are about to write, they win — and that is worth stating in the index.

Look at what documentation already exists (`Glob docs/**/*.md`, `doc/`, a wiki folder). Use its language, its heading style and its index. Write in the language the repository's existing documentation uses; ask only if there is none.

Find the project's markdown lint config (`.markdownlint*`, `.pre-commit-config.yaml`). Every file you produce must pass it, or it cannot be committed.

## Phase 1 — Survey before writing a word

Build a facts ledger first — a scratch file of things you have **verified**, kept in a temporary or scratchpad directory outside the repository (or deleted before you report), so it is never committed by accident. Nothing reaches a document that is not in it. Take only the rows that apply to this project, and add rows for what it has that is not listed:

| Measure | How |
| :--- | :--- |
| Modules / services / packages | List the directories; count them |
| Entry points, routes, handlers, commands, public exports | `Grep` the route registrations, command definitions or export lists |
| Entities / tables / schemas | Count what the migrations or schema files define, **minus** what they drop |
| Numbered files (migrations, versions, changelog entries) | List them and sort numerically — not lexicographically, or `9` beats `33` |
| Scheduled and background work | Read where the jobs are registered, not the job implementations |
| External dependencies | Read the clients or adapters and their configuration keys |
| Test layout | Count the test suites or folders and what is actually in them, including the empty ones |
| Build and deploy | Read the pipeline config, the Dockerfiles, the deploy scripts |

Then read the project's **defect and decision ledger**, wherever it keeps one — a fixes folder (`docs/changes/fixes/` from `implement-change`, `docs/fixes/`), rules or ADR folders, a CHANGELOG, closed bug issues. If there is none, fall back to the recent commit subjects (`git log --grep` for fix/revert). You need it for rule 3 below.

## Phase 2 — Structure

Propose this shape — an illustration, not a required layout: names and the numeric prefixes are optional, and an existing docs layout and naming win — then adapt it to the project:

```text
<root>/
├── README.md                      the index, the date, and what this does not replace
├── CHANGELOG.md                   what changed in this documentation, newest first
├── architecture/
│   ├── adr/                       the decisions (see `create-adr`)
│   ├── diagrams/                  context, containers, the primary business flow
│   └── data-lineage.md            where data enters, what transforms it, where it lands
├── technical-spec/
│   ├── api/                       contract conventions + sequence diagrams (or the public surface of a library/CLI)
│   ├── database/                  model, conventions, ER diagram by module
│   └── security/                  authn, authz, secrets, the error contract
├── development/                   onboarding, run locally, testing, coding standards
└── operations/                    pipelines, environments, runbooks
```

The tree is a suggestion, not a mould. Keep a section only when the project has something real to put in it, and rename or merge folders to fit — a library has a public API and no database; a static site has no `security/`; a data pipeline's centre of gravity is `data-lineage.md`. **Drop a section the project has no answer for rather than stubbing it.**

**Where to put it.** If the repository already has a `docs/` with its own index, put this tree in a subfolder and add one row to that index. Do **not** overwrite an existing documentation index — it describes folders this tree knows nothing about, and overwriting it deletes them from view. If there is no docs folder, ask where it should live, recommending `docs/`.

## Phase 3 — The rules that keep it true

These are not style preferences. Each one is a specific way this kind of tree has been wrong.

**1. Date the snapshot, in the index, in the first screen.** Not in the changelog where nobody looks. "Written from the code on <date>. It describes that state, not the target of any plan."

**2. A negative claim is a claim about your search, not about the system.** Never write "there is no X". Write what you did: "no X found — searched `<terms>` across `<paths>` on `<date>`". The difference is not pedantry. A generated tree once stated that an API had no authentication, because the grep ran before the auth layer was merged; it was read for months as fact.

**3. Never document a defect as design.** Before describing any mechanism, check the defect ledger for it. Code that is wrong still runs, and a diagram drawn faithfully from it documents the bug as architecture. If the ledger shows a mechanism was fixed, describe the fix.

**4. Count. Never estimate.** No "~75 tables", no "about 60 entities". Run the count and write the number. A round number in documentation is a number nobody checked — and when it is wrong, everything near it loses credibility too.

**5. Cite paths and symbols, never line numbers.** `parse_config()` (or `Config.parse`) survives a refactor. `config.py:214` does not, and a wrong line number makes a true statement look false.

**6. A gap is a `TODO:` that names what is missing and who can answer it.** Never fill a gap by inference. "TODO: confirm the retention policy with the data owner" is useful. A plausible invented paragraph is worse than a blank.

**7. Say what this tree does not replace.** List the normative sources — the `CLAUDE.md`/`AGENTS.md`, the migration files, the authorization mapping — and state plainly that where they and this tree disagree, they win.

**8. Write why, not what.** A table restating field names the reader can get from the schema is noise that still has to be maintained. Document the decision, the constraint, the trap.

## Phase 4 — Produce

**Before writing, show the final tree and the target folder and wait for a yes.** If the tree this skill produces already exists (an index with a snapshot date, the folders above), never overwrite a file: add only the missing sections and send changes to existing ones through `update-docs`. Then work section by section, in the Phase 2 order. For each one: pull from the facts ledger, write it, and move on. Do not write a section whose facts you did not gather.

Diagrams in Mermaid, unless the repo already uses another notation. Keep each one to a single idea — a diagram per module or per flow, not one graph of everything, which nobody reads and nobody updates.

## Phase 5 — Verify before reporting

Go back over what you wrote and re-check, specifically:

- every **number** — recount it
- every **negative claim** — is it phrased as a search result, with its date?
- every **path** — does it still exist?
- every **mechanism** — is it the current one, or the one the defect ledger says was replaced?
- the **lint** — run the project's own config, not a default

Then report: the files produced, and an explicit list of what you marked `TODO` and why. The `TODO` list is the honest part of the deliverable — lead with it, do not bury it.

To keep the tree current afterwards, use `update-docs`.

**Do not run `git add` or `git commit`.** `commit-push` does that.
