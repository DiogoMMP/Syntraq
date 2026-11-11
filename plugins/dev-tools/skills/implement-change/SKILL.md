---
name: implement-change
description: "Implement a change (feature, bugfix or hotfix) end to end, in any project and stack, and leave the written record. Takes the request in any form (free text, issue key or URL, wiki page, spec, screenshots, a pasted conversation), turns it into evidence and sets the change type, then: investigate, ask the open decisions, write the full plan as docs/changes/TYPE/PREFIXNNNN-slug/README.md before any code, show a short summary and wait for approval, implement, run the project's verification gate, write RESULT.md with what actually happened, update the type's index and report. Does not commit, push or open a PR (commit-push and create-pr do that). Use when the user wants a feature, bugfix or hotfix implemented, an issue implemented, or work planned and done with its record — e.g. 'implementa esta feature', 'corrige este bug com registo', 'faz este hotfix', 'implementa o ABC-123', 'implement this ticket', 'build this', 'quero acrescentar X'."
---

# Implement Change — plan, build, record

This skill produces **three things, in this order**, and the order is the point:

1. `docs/changes/<type>/<PREFIX><NNNN>-<slug>/README.md` — the **spec**, written and approved **before any code**.
2. The **implementation**.
3. `docs/changes/<type>/<PREFIX><NNNN>-<slug>/RESULT.md` — what **actually** happened, including the deviations.

Both documents live in the **same folder**. The same process — plan gate, README before code, RESULT after — applies identically to all three change types below. Urgency is not a reason to skip the record; a hotfix done at 2am is exactly when a written "what and why" matters most.

| Type | Prefix | Record folder | Typical branch | Base |
| :--- | :--- | :--- | :--- | :--- |
| Feature | `F` | `docs/changes/features/` | `feature/<slug>` | `develop` |
| Bugfix | `B` | `docs/changes/bugfixes/` | `bugfix/<slug>` | the `release/*` it targets |
| Hotfix | `H` | `docs/changes/hotfixes/` | `hotfix/<slug>` | `main` |

Each type keeps its **own independent numbering** (`F0001`, `F0002`, … / `B0001`, `B0002`, … / `H0001`, `H0002`, …) and its own index file, so the three families never collide.

**Why `docs/changes/` and not `docs/` directly:** a project's `docs/` folder may also host a personal knowledge-base vault (`wiki/`, `notes/`, `.obsidian/` — see the `knowledge-base` skill). Nesting all per-change records under `docs/changes/` keeps them out of that vault's file tree and graph instead of mixing per-PR paperwork into synthesized, always-current knowledge. If a project's `docs/` has no such vault, `docs/changes/` is still the right place — consistency across projects beats a shorter path in the ones without a KB.

**Stack-agnostic by design.** This file describes the *process*. Every technical rule — layering, naming, migrations, test layout, commit style — comes from **the project you are in**, discovered in Phase 0.5. Never apply a convention from another project, and never assume a language or framework: read the repo.

**Out of scope, deliberately:** this skill never commits, never pushes, never opens a PR, never merges. Hand that to `commit-push` and then `create-pr` when the work is done.

**Markdown without hard wraps.** Write the records (`README.md`, `RESULT.md`, the index) and any other `.md` file you touch with one paragraph, list item or table row per line, however long — never break lines at 80/100/110 columns. The viewer wraps them; manual breaks only make diffs noisy and the text awkward on other screen widths. Line breaks belong between paragraphs, list items, headings and table rows, and inside code blocks.

**Language of the records:** match the language of the records already in that type's folder (`docs/changes/<type>/`). If there are none, match the language of the repo's other docs; failing that, the language the user is writing in. Technical vocabulary stays in English either way — code identifiers, paths, branch names, issue keys, commands, product and tool names, and established IT terms with no natural local equivalent (*endpoint*, *middleware*, *build*, *deploy*, *cache*, *token*, *job*, *log*). Code and code comments follow the repo's own convention.

---

## Phase 0 — Input collection: accept anything, normalise it

The request may arrive in any shape. Take it as given and convert it into something a reviewer can check. Handle each source with the right tool:

| Input shape | How to read it |
| :--- | :--- |
| Free-text description | Use as-is; it is the primary statement of intent. |
| JIRA / Linear / GitHub issue key or URL | Load the matching MCP or CLI tool (`ToolSearch` for Atlassian MCP, `gh issue view` for GitHub) and fetch the issue — summary, description, acceptance criteria, comments, linked items, attachments. |
| Confluence / Notion / wiki URL | Same route — fetch the page and read it in full, not just the title. |
| Any other URL | `WebFetch`. |
| Local file (spec, `.md`, PDF, export) | `Read` it. |
| Screenshot / image / Figma frame | `Read` it (or the Figma tooling) and describe in the record what it shows. |
| A pasted conversation or set of notes | Extract the requirement; separate what was **decided** from what was merely **discussed**. |

Then state, in chat, the request **as you understood it** — one short paragraph plus the acceptance criteria you extracted — and name the source of each. This is cheap, and it catches a misunderstanding before a day of work rather than after.

**Determine the change type — feature, bugfix, or hotfix.** Infer it from the evidence rather than asking by default:

- Already on a branch matching the repo's `feature/*` / `bugfix/*` / `hotfix/*` pattern → that branch's type wins.
- The request describes new capability or behaviour that didn't exist before → **feature**.
- The request describes broken existing behaviour, found in a release candidate or in `develop` before it ships → **bugfix**.
- The request is an urgent fix for something already broken **in production** (`main`) → **hotfix**.

If the evidence genuinely doesn't settle it (e.g. free text alone, no branch, ambiguous wording), ask once with `AskUserQuestion`, recommendation first. Never guess silently on this — it decides the prefix, the folder, the branch, and the base for everything that follows.

**Ask only what you cannot resolve.** Missing information that changes the shape of the work (which component, which behaviour on conflict, whether an existing interface changes or a new one appears) → ask with `AskUserQuestion`, one decision at a time, with a concrete recommendation first. Missing detail you can settle as a careful colleague → settle it, and record it under *Decisions*.

**Never invent a requirement.** If the source does not say it, it is not in scope; if you think it should be, propose it at the plan gate as an explicit addition — do not quietly build it.

---

## Phase 0.5 — Learn this project before planning anything

Everything technical comes from here. Read, in this order:

1. **The conventions file** — `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.cursorrules`, whatever the repo carries. **It outranks this skill on every technical question.** Read it once, fully.
2. **The shape of the repo** — enough to place the change:

   ```bash
   ls
   git log --oneline -15
   git branch --show-current
   cat README.md 2>/dev/null | head -60
   ls docs/ 2>/dev/null
   ls docs/changes/ 2>/dev/null
   ```

3. **The stack and its gate** — from the manifest, not from a guess: `package.json` scripts, `Makefile` targets, `pyproject.toml`, `*.csproj`/`*.sln`, `Cargo.toml`, `go.mod`, the CI workflow in `.github/workflows/`. Note the exact build / test / lint / typecheck commands; you will run them in Phase 4 and cite them in the record.
4. **The existing records for this change type** — `ls docs/changes/<type>/` and read the newest one. It tells you the section structure, the language, the numbering and the index this project expects. If a sibling type has records but this one doesn't, use the sibling's structure as the closest precedent rather than inventing one from scratch.

**When the conventions file and the disk disagree** — it declares a layout, a folder or a tool that is not there — **stop and report; do not pick a side.** Say which is which and let a person decide. A conventions file that describes a project it no longer matches steers every later change wrong.

**Branch.** Every change type belongs on its own branch, per the table above (`feature/<slug>` from `develop`, `bugfix/<slug>` from the `release/*` it targets, `hotfix/<slug>` from `main` — follow the repo's own strategy and any issue-key pattern visible in `git log` if it differs). If you are on an integration branch, or on a branch of the *wrong* type for this change, stop and say which branch is needed — offer to create it, never create it unasked. Keep the branch slug equal to the record folder's slug, so `git log` and `docs/changes/` speak the same language.

---

## Phase 1 — Investigation

Map the request onto the codebase before writing a line of the plan. Read the real files in every area the change will touch.

### Investigation discipline (each of these has cost someone real time)

- **Check whether it already exists.** Grep for the route, the field, the function, the component, the job. A good share of "missing" functionality is present under another name, or was present and removed — check `git log -S<symbol>` and `git show` too.
- **Reuse before you add.** An existing helper, validator, shared type, wrapper or base class. A second parallel implementation of the same thing is a defect review rarely catches.
- **Read the code that already does the nearest thing** and follow it — its layering, its naming, its error handling, its test style. New code that reads like the code around it is the goal; a locally better pattern nobody else uses is a cost.
- **Read the project's own recorded lessons** when it keeps any — `docs/changes/fixes/`, `docs/rules/`, `docs/adr/`, previous `docs/changes/*/*/RESULT.md`. A change that contradicts a recorded decision must say so out loud, not silently.
- **Plan the whole family, not the instance.** A new field usually also belongs in the list response, the export, the validator, the mapper, the fixtures and the tests. Scope the siblings now; discovering them mid-implementation is what makes a plan mislead about cost.
- **Verify the premise still holds.** If the request is based on a report or an older analysis, check the current code before designing around it.
- **For a bugfix or hotfix specifically: reproduce it first.** Confirm the broken behaviour in the current code (a failing test, a repro script, a traced code path) before proposing a fix. A fix for a bug you haven't actually reproduced is a guess.

### Resolve the record identity

- **`<PREFIX><NNNN>`** — the next free number **for this change type**. If the project keeps an index (`docs/changes/<type>/README.md`), read it and take the next one; otherwise take the next after the highest existing folder under `docs/changes/<type>/`. Four digits, sequential, **never reused**, not even for an abandoned change. Feature, bugfix and hotfix numbering never share a counter.
- **`<slug>`** — 3–6 kebab-case words naming the change, matching the branch slug.
- If `docs/changes/<type>/` does not exist yet, create it and say so — this is record number one for that type. If `docs/changes/` itself doesn't exist yet either, create that too.

---

## Phase 2 — Ask, draft the plan as the README, then gate on it

**Mandatory for every change, feature, bugfix or hotfix alike.** A change always gets a written plan, and the plan always gets approved **before any code** — urgency shortens how long you spend on it, never whether it happens.

1. **Resolve every open decision first.** Use `AskUserQuestion`, one decision at a time, each with a recommendation and its trade-off — which component, behaviour on conflict, whether an existing interface changes or a new one appears. **Do not touch code while a question is open.** Don't draft the README around a guess when a real decision is still open.

2. **Write the full `docs/changes/<type>/<PREFIX><NNNN>-<slug>/README.md` directly — this *is* the plan**, not a chat summary standing in for it. Fill in every section below with the decisions just made. It's a draft until the gate in step 3 approves it, so it's fine to revise it in place if the user asks for changes before that.

**Where the structure comes from**, in order of preference:

1. **The newest existing record of this type** in this project's `docs/changes/<type>/` — follow its structure exactly.
2. A template the project ships (`docs/templates/`, `.github/`), or one from an installed plugin: `ls -d ~/.claude/plugins/cache/*/*/*/docs/templates/ 2>/dev/null | sort -V | tail -1`
3. **The structure below**, when the project has neither.

| Section | Must contain |
| :--- | :--- |
| Metadata table | Type, branch (and base), state, scope in one line, how it will be verified |
| §1 Situation | What exists today; an **Evidence** list of real file paths, config values, log lines or source artefacts a reviewer can go and confirm; a numbered **Inventory** (A, B, C…) of the surfaces in scope; **Scale** as a number, not an adjective |
| §2 Intended outcome | The end state described as how it works, not as what the change is called; **Decisions** with the concrete value chosen; **Rejected alternatives** and why — the part that saves the next person's time |
| §3 Implementation | Numbered phases in execution order, each independently commitable and verifiable, naming the actual files |
| §4 Verification | The project's own commands and what counts as passing, with the pre-existing warning/failure baseline stated explicitly |
| §5 Risks | One per risk, with how you validate it did not happen. **An empty §5 means the plan is not ready.** |
| §6 Commit order | One row per reviewable unit, linked back to the §1 inventory |
| §7 Out of scope / handoff | What was decided **not** to do, and who it goes to |

Delete sections that genuinely do not apply — an empty section kept is noise. Adapt the section names to whatever the project's existing records use.

> **Check for commit hooks before you write §3 and §6.** `ls .pre-commit-config.yaml .husky/ .githooks/`, or `git config core.hooksPath`. When the repo formats or lints on commit, plan **as many small phases and commits as the work allows** — even within one coherent change, as long as each still builds and no two fight over the same lines. Hook cost scales superlinearly with the staged set (formatters run per batch, twice per batch when they find something), long runs get killed and leave orphaned compiler daemons, and pre-commit's stash/restore of whatever is left unstaged can roll back over untouched files and mangle shared solution or project files. A phase plan of "one commit for everything" is what makes those failures certain rather than possible.
>
> Put the **enabling change in its own first phase** — the dependency swap, the config or hook fix, the shared abstraction — then the code that consumes it, then the tests. `commit-push` carries the full mechanics; §6 just has to give it units small enough to work with.

3. **PLAN GATE — show a summary, point at the file, wait.** Post in chat a short summary that fits on one screen: the situation, the key decisions and why, what's deliberately out of scope, and the record's file path. **Do not paste the whole README into chat** — say the full plan is in that file if the user wants to read it in detail. Then ask for explicit approval with `AskUserQuestion` and **end the turn. Do not start Phase 3 while this is open**, and do not touch any code.

4. **Accept edits.** If the user asks to change the plan — from the summary alone, or after opening the file — revise the README itself (it's still a draft) and re-show an updated summary. Only an explicit approval ("ok", "sim", "avança", "implementa") opens the gate to Phase 3.

> **Once approved, the README is the spec as approved.** From that point on you do **not** rewrite it to match what happened during implementation. Deviations go in `RESULT.md`. A README edited after approval to match reality stops being a plan and becomes a second, tidier RESULT.

---

## Phase 3 — Implementation

Implement **the phases of §3, in order**, so each one can be committed and verified on its own. Work along the project's own dependency direction — schema/data first, then the layers that depend on it, tests alongside.

The technical rules are the project's, from the conventions file read in Phase 0.5. What this skill adds on top, and holds everywhere:

- **Write the minimum the change needs.** Touch only what §3 says you will touch. Adjacent work worth doing goes to §7 / RESULT, not into this change — this holds even harder for a hotfix, where the smallest diff that fixes the incident is the goal, not a broader cleanup.
- **Match the surrounding code** — its structure, naming, error handling, logging, comment density and test style.
- **Schema and data changes go through the project's migration mechanism**, never by hand-editing a committed migration and never by a tool the repo does not use. Keep any parallel model definition in sync in the same change. A migration that removes something purges every reference to it in the same change.
- **Never weaken a test to make it pass.** Add tests for the new behaviour in the project's existing style and location. For a bugfix or hotfix, the new test must **fail against the old code** and pass against the fix — that's what proves the bug is actually fixed, not just no-longer-triggered. If a test suite is intentionally failing (a red-by-design spec), leave it and say so.
- **No secrets, no credentials, no debug leftovers** committed. Nothing logged that should not be.
- **Remove what your own change made unused** — imports, variables, functions, dead branches.

If reality diverges from the plan — a phase turns out impossible, a defect blocks the path, the work is bigger than scoped — **stop and say so** rather than improvising a different change. Small divergences you resolve yourself get recorded in `RESULT.md` §3.

---

## Phase 4 — Verification

Run **the project's own gate**, the exact commands found in Phase 0.5 — build, then tests, plus lint and typecheck when the repo has them. Never substitute a command the project does not use, and never invent one.

- **State the baseline.** If the repo already had warnings or failing tests before your change, name them; a gate reported without its baseline cannot be read.
- **Run the whole suite, not a filter that matches nothing.** A filter that matches zero tests exits successfully and proves nothing — check the reported count is plausible.
- **A step that needs a running environment and could not be run is not a pass.** It goes to `RESULT.md` §4 *Not yet verified*, with what is needed to run it. This is the step that gets skipped; do not skip it.
- Never report green without having seen it. If it fails, fix the cause and re-run until it passes, or stop and report the blocker with the output.

---

## Phase 5 — RESULT.md

> **HARD STOP BEFORE THE FINAL RESPONSE.** The record is not optional. Delivering the implementation without `RESULT.md` is a failure of this skill, however long Phases 1–4 took, and however urgent the hotfix was.

Write `docs/changes/<type>/<PREFIX><NNNN>-<slug>/RESULT.md` — **added beside the README, which stays exactly as approved.** Structure from the same source as the README (existing record of this type → template → the table below).

| Section | Must contain |
| :--- | :--- |
| Metadata table | Type, branch, state (implemented / partially implemented — see §2), build **with baseline**, tests (and how many are new), coverage if gated, commits |
| §1 What was closed | Same A/B/C numbering as the README's inventory, so the two can be read side by side |
| §2 Points needing a decision | Each with its **operational consequence** — what the team will see happen until someone decides. "Later" is not a consequence |
| §3 Deviations from the approved plan | Where implementation diverged from the README, and why |
| §4 Not yet verified | What §4 of the README asked for and could not be run, with the reason. Never blank for convenience |
| §5 How to run the verification | The commands, and what each one proves |
| §6 Inventory of changes | Every path, marked new / changed / deleted, one line each — so a reviewer knows where to look first |

**Do not soften it.** A blocked step, partial work, a pre-existing gap found in passing — all of it goes in, named. A `RESULT.md` that reads exactly like its `README.md` is almost always hiding something.

### Then update what the project keeps

- **That change type's index**, if there is one (`docs/changes/<type>/README.md`): add the row for this change — id linking to `README.md` and `RESULT.md`, title, state, date, branch, and an *open items* column summarising §2 of the RESULT. Follow the table's existing columns and state vocabulary. Without this row the record is invisible.
- **The project's defect ledger**, if it keeps one (`docs/changes/fixes/` or equivalent) — only when the work also closed a **distinct pre-existing defect** along the way. One new file per defect, in that ledger's own format, cross-referencing this change's folder.
- **The conventions file** — only if the change modified a project-wide convention, and say so in the report.

---

## Phase 6 — Report

Short and factual:

- **Type and record folder** — feature/bugfix/hotfix, the path, and confirmation that both `README.md` and `RESULT.md` are in it.
- **What was built** — one line per §1 inventory item, closed or not.
- **Files changed** — the full list.
- **Gate** — the commands you ran and their real results, with the baseline.
- **Open items** — everything in RESULT §2 and §4, each with its consequence.
- **Index / ledger** — what you updated.
- **Next step** — the work is uncommitted: `commit-push` to commit (and push), then `create-pr` to open the PR. Do not run them from here.

---

## Credits

Credits to [@michelgomessilva](https://github.com/michelgomessilva).
