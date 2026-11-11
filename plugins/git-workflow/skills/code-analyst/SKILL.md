---
name: code-analyst
description: "Analyse the code a branch is about to ship, read-only, before its pull request: launches several specialised agents in parallel (correctness, security, tests, conventions and consistency, simplification and reuse, docs and change records), each reading the real diff against the base branch, then merges and de-duplicates their findings into one ranked report with file:line evidence. Never edits, commits, pushes or opens a PR. Called by `create-pr` before it drafts the body; also use when the user wants a branch or diff reviewed — e.g. 'analisa o código antes do PR', 'revê esta branch', 'faz uma análise ao diff', 'review my changes', 'code analyst', 'anything wrong with this branch?'."
allowed-tools: ["Bash", "Read", "Grep", "Glob", "Agent", "AskUserQuestion"]
---

# Code Analyst — parallel specialist review of a branch

**Scope.** This skill *reads and reports*. It never edits a file, never stages, commits, pushes, opens a PR or comments on one. Fixing is the user's decision, done afterwards (by hand, with `implement-change`, or with `commit-push` for the fix commits).

It exists to be called from `create-pr` — a reviewer-grade pass over the diff before the body is written — but works standalone on any branch.

**Why several agents:** one reader asked to check everything skims everything. Specialists with a narrow brief and a fresh context each look harder at one thing, in parallel, and the merge step is where noise is removed. More agents than the roles below is not better; one per role, no more.

---

## Step 1 — Resolve the target and read the shape of the change

1. **Base and head.** If invoked by `create-pr`, use the base it resolved. Otherwise resolve it the way `create-pr` does (`feature/*` → `develop`, `bugfix/*` → its `release/*`, `hotfix/*` and `release/*` → `main`, other prefixes → `develop`; no `develop` on the remote → the default branch; the repo's `AGENTS.md`/`CLAUDE.md` wins). The user can also name a PR number, a branch or a path — then that is the target.
2. **Inventory** (cheap, you do this yourself):

   ```bash
   git log --oneline origin/<base>..HEAD
   git diff --stat origin/<base>...HEAD
   git diff --name-only origin/<base>...HEAD
   ```

3. **Conventions.** Read `CLAUDE.md` / `AGENTS.md` / `CONTRIBUTING.md` if present — the rules the conventions agent will hold the diff to — and note the project's build/test/lint commands.
4. **Size check.** A diff of a few lines does not need six agents: for fewer than ~5 changed files or ~150 changed lines, run only *Correctness* and *Conventions*, and say so. For a large diff, split the files between agents of the same role by area rather than letting one agent read everything.

If the diff is empty, stop and say so.

---

## Step 2 — Launch the specialists, in parallel

Send **all agents in one message** (independent, so they run concurrently). Use `subagent_type: "general-purpose"` — or `Explore` for roles that only read. Every brief carries the same header, then the role:

> You are one reviewer on a branch about to become a pull request. READ-ONLY: do not edit, stage, commit or run anything that writes. Target: `git diff origin/<base>...HEAD` (head `<branch>`). Changed files: `<list>`. Project conventions: `<one-paragraph digest, plus the file to read>`. Review only *what this diff introduces or changes*; a pre-existing problem you trip over is reported separately as "pre-existing", never mixed in. Report at most 10 findings, strongest first. Each finding: `file:line`, severity (`blocker` / `major` / `minor` / `nit`), what is wrong, the concrete input or state that triggers it (or why it is a risk), and a suggested fix in one line. If you find nothing in your role, say "nothing found" — do not pad.

| Role | Brief |
| :--- | :--- |
| **Correctness** | Logic errors, off-by-one, null/undefined handling, wrong conditions, unhandled error paths, race conditions, resource leaks, broken contracts with callers, behaviour that no longer matches its name or docs. Trace the changed code paths; read the callers and callees, not just the hunk. |
| **Security** | Injection (SQL, command, template, path traversal), authn/authz gaps, secrets or tokens in code or logs, unsafe deserialisation, missing input validation at trust boundaries, SSRF, over-broad CORS/permissions, new dependencies of doubtful provenance. Only real exposure, with the attack path. |
| **Tests** | Does each changed behaviour have a test that would fail without it? Missing cases (error path, boundary, empty), tests that assert nothing or only mock the thing they test, weakened or deleted assertions, flaky patterns (time, order, network). Run the project's test command if it is cheap and say what it printed. |
| **Conventions & consistency** | Compare the diff to the conventions file and to the *neighbouring code*: layering and dependency direction, naming, error-handling and logging style, folder placement, commit/branch naming, leftover debug code (`console.log`, `print`, TODOs without owner), commented-out code, unused imports and variables the change created. |
| **Simplification & reuse** | Does an existing helper, type or component already do this (grep for it)? Duplicated logic, needless abstraction or indirection, over-engineered parameters, dead branches, work done in a loop that belongs outside it, avoidable allocations or queries (N+1). Suggest the smaller version. |
| **Docs & records** | README / `AGENTS.md` / API docs / changelog that the diff makes stale; new env vars, flags or commands that are undocumented; `docs/changes/` records the branch adds or touches (read them): do the README and `RESULT.md` agree with what the code actually does, are any promised files missing, is the index row there; version bumps the repo's convention requires. |

Skip a role that cannot apply (no tests in a docs-only diff, no security surface in a typo fix) and say which you skipped and why.

---

## Step 3 — Merge, verify, rank

You are the filter; the agents over-report. Before anything reaches the user:

1. **De-duplicate** findings that point at the same line or cause — keep the strongest framing and note which roles saw it (agreement across roles raises confidence).
2. **Verify every `blocker` and `major` yourself**: open the cited file at the cited line and confirm the problem is real and caused by this diff. Drop what does not survive; downgrade what is real but smaller. Never forward a finding you have not seen in the code.
3. **Separate** "introduced by this diff" from "pre-existing" — the second list is information, not a reason to hold the PR.
4. **Rank**: blocker → major → minor → nit. Cap the report at what a reviewer would actually read: all blockers and majors, the best handful of minors, nits collapsed to a count.

---

## Step 4 — Report

Print one report, in the language the user is writing in (code identifiers and paths unchanged):

```
## Análise — <head> → <base>   (<N> ficheiros, <M> commits, agentes: <roles used>)

Veredicto: <pronto para PR | pronto, com pontos a decidir | não está pronto>

### Blockers / Majors
1. [major] `path/file.ext:42` — <what, trigger, one-line fix>   (visto por: Correctness, Tests)

### Minors
- `path:line` — …

### Já existia antes desta branch
- `path:line` — …

### Não verificado
- <role skipped / command not run, and why>
```

- The verdict is *not ready* only when a verified blocker exists; majors alone give "ready, with points to decide".
- State plainly what you did not check (a test command you did not run, a role you skipped).
- Do not offer to fix inline and do not start fixing. When invoked standalone, end by saying the user can fix and re-run; when invoked by `create-pr`, hand the report back to it unchanged.
