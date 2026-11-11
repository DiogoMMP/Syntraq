---
name: create-agents-md
description: "Write or update a code repository's AGENTS.md (the instructions file every coding agent reads: Claude Code, Codex, Cursor, Copilot, Gemini CLI) together with the user, section by section. Drafts from `/init` and what it can prove in the repo (manifests, scripts, CI, branch and commit history, code patterns), then asks what the code can't tell (gotchas, never-dos, language, git workflow, with a recommendation). Keeps only lines whose absence would make an agent go wrong. Makes Claude Code read it (an `@AGENTS.md` import when a CLAUDE.md exists), never touches a knowledge-base block, and shows the full file or diff before writing. Code repos only. Use when the user wants an AGENTS.md or CLAUDE.md created, updated or reviewed — e.g. 'cria o AGENTS.md', 'faz o CLAUDE.md deste projeto', 'atualiza o AGENTS.md', 'instruções para o agente', 'write the agent instructions', 'set up CLAUDE.md'."
allowed-tools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit", "Skill", "AskUserQuestion"]
---

# Create AGENTS.md — with the user, from the repo

`AGENTS.md` is the open standard for telling coding agents how a repository works; Claude Code reads it too. This skill builds it **as a partnership**: it proves what it can from the repository, asks the user for what only they know, and writes nothing until they've seen the result.

**What belongs in it** (Claude Code's memory docs and the agents.md standard agree): what you would otherwise re-explain to every new agent session — commands, conventions, layout, "always do X" rules — written so they can be checked ("run `npm test` before committing", not "test your changes"), grouped under headings, never contradicting each other. Multi-step procedures belong in a skill; rules for one part of the code belong in a nested `AGENTS.md` there.

**The cut — information, not line count.** Each line must pass one test: *without it, would an agent get something wrong in this repo?* If not, it goes. That removes what the language already imposes, what changes every week, what the code says plainly, and file-by-file descriptions. There is no line limit; long files are only a problem when they carry lines that fail the test.

## Ground rules

- **Markdown without hard wraps.** Write every `.md` file with one paragraph, list item or table row per line, however long — never break lines at 80/100/110 columns. The viewer wraps them; manual breaks only make diffs noisy and the text awkward on other screen widths. Line breaks belong between paragraphs, list items, headings and table rows, and inside code blocks. This applies to the `AGENTS.md` itself; also offer to state it in the file's *Conventions* as a rule for agents writing docs in the repo.
- **Code repositories only.** A knowledge base writes its own `AGENTS.md` block (the `knowledge-base` skill); if the folder is a KB, say so and stop.
- **Never invent.** Commands, paths and versions come from real files; a command is listed only if it exists. What the user says goes in as the user said it.
- **Never touch a `<!-- kb:start -->` … `<!-- kb:end -->` block** — it belongs to the `knowledge-base` skill. Write around it.
- **No secrets.** Env var *names* and where they're read, never values; nothing a secret scanner would flag.
- **Write nothing without approval**, and never commit — that's `commit-push`.
- **Language:** ask which language the file should be in (default English, the agents' common ground; the project's own language when its docs and domain are in it). Technical terms, commands and identifiers stay as they are.

## Steps

1. **Take stock.** Look for `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, nested `AGENTS.md`/`CLAUDE.md` in subfolders, `.cursorrules`/`.github/copilot-instructions.md`, a `kb:start` block, `README.md` and `CONTRIBUTING.md`. Decide the mode:
   - **create** — no `AGENTS.md` yet;
   - **update** — one exists (go to "Update mode" below). Other agents' rule files and an existing `CLAUDE.md` are inputs: offer to bring their content in, so there is one source of truth.

2. **First draft from `/init`** — only when the repo already has code **and** has neither a `CLAUDE.md` nor an `AGENTS.md`. Run the `init` skill: it analyses the codebase and writes a `CLAUDE.md` with the commands and conventions it finds. Treat that file as raw material only: read it, carry what's useful into the `AGENTS.md` draft, and **delete it right away**, before the interview — so nothing unapproved is left in the repo if the user rejects the draft or the flow stops. Step 8 decides, with the user, whether a one-line `CLAUDE.md` is written at the end. Never run `/init` over an existing `CLAUDE.md`. In an empty repo, skip it.

3. **Investigate what `/init` misses.** Read, don't guess:
   - **manifests and scripts** — `package.json` scripts, `Makefile`, `*.csproj`/`*.sln`, `pyproject.toml`, `pom.xml`/`build.gradle`, `go.mod`, `Cargo.toml`, `docker-compose*.yml` — for the real build/test/lint/format/run commands per subproject, and how to run a single test;
   - **test config** — where tests must live to be picked up, what the suites actually cover;
   - **CI** (`.github/workflows/`, `.gitlab-ci.yml`, …) — what runs, on which events, and what does **not** run; branch guards; PR-title checks; release automation (release-please, semantic-release, Changesets, GitVersion — then versions are never bumped by hand);
   - **git history** — `git branch -a`, `git log --oneline -30`, merge commits: the branching model in use, branch prefixes, Conventional Commits or not, the language of commit messages;
   - **the code** — the layering, the patterns a new file should imitate (name a reference file for each), wiring that must happen in more than one place, the module system, where config is read;
   - **docs** — `docs/changes/` (the `implement-change` records), ADRs, domain-model diagrams, a code-mode knowledge base under `docs/`. When it's cheap and safe (lint, unit tests, a build), run a command to confirm it works; say which ones you ran.

4. **Interview, section by section.** Go through the template's sections in order. For each one, show what you proved (with where it came from) and ask with `AskUserQuestion` what the repo can't tell — one section at a time, never a wall of questions. Always cover:
   - **Project** — confirm the 2–3 line summary; the language of UI and domain terms.
   - **Commands** — confirm the list; anything missing (seeds, migrations, local services).
   - **Architecture / Conventions** — "is there a pattern every new X must follow?", "anything that must be registered in more than one place?".
   - **Git workflow** — see step 5.
   - **Language** — of answers to the user, code comments, commit messages, PR descriptions, docs.
   - **Gotchas** — "what would an agent get wrong here?", "what has bitten you before?".
   - **Never** — offer the usual set (commit secrets or `.env`, force-push, `--no-verify`, edit generated files, touch migrations already applied…) and ask what to add or drop.
   - **More context** — where the human docs live.

5. **The git workflow — ask, with a recommendation.** Start from what step 3 found, then ask:
   - Do you commit directly on `main`? Is there a `develop`? Which branch types do you use (`feature/`, `fix/` or `bugfix/`, `hotfix/`, `release/`, `chore/`, `docs/`…)? Do changes reach `main` only through PRs, and merged how (merge commit, squash, rebase)? Who bumps versions?
   - Recommend, saying why, from what the repo is:

     | The repo | Recommend |
     | --- | --- |
     | Has releases or deploys, CI, a version history worth protecting, or collaborators | **GitFlow**: `main` = released code, `develop` = integration; `feature/*`, `fix/*` from `develop`; `hotfix/*` from `main`, merged back into `develop`; `release/*` when cutting a version; PRs only — into `main` only from `develop`, `release/*` or `hotfix/*`; never commit on `main`/`develop`. |
     | Small personal project, library or tool with one maintainer and no release train | **GitHub flow**: `main` always working; every change on a short-lived `feature/*` or `fix/*` branch merged by PR; no `develop`. |
     | A scratch repo or notes with no CI and nothing to protect | Committing on `main` is acceptable — say what is given up (review, a clean revert point). |

     Whatever the choice: record the commit convention the repo actually uses (from step 3), and recommend Conventional Commits — with branch prefixes that match the commit types — only as a suggestion the user can turn down; if CI enforces something (a branch guard, a PR-title check), the file states it as a rule.
   - Write down exactly what the user decides — `commit-push` and `create-pr` read this section and follow it over their own defaults.

6. **Apply the cut** (see above) to the whole draft. Move what only matters for one subproject to a proposed nested `AGENTS.md` in it; turn long procedures into a suggestion for a skill; keep one statement of each rule. Where the template's placeholders have no answer, delete the section.

7. **Show the complete file and wait for a yes.** Show the full `AGENTS.md` (and any nested ones) exactly as they will be written. On changes, show it again. Only an explicit approval writes it.

8. **Make Claude Code read it.** Claude Code reads `AGENTS.md` on its own only when there is no `CLAUDE.md`/`.claude/CLAUDE.md`/`CLAUDE.local.md` in the directory or above; with one, it reads only that file unless it imports `AGENTS.md`.
   - A `CLAUDE.md` exists → offer to add `@AGENTS.md` at its top (and to move anything it repeats into `AGENTS.md`). Write only on a yes.
   - No `CLAUDE.md` → ask whether to create a one-line `CLAUDE.md` containing `@AGENTS.md`, which also covers older Claude Code versions and sessions that can't read `AGENTS.md` directly.

9. **Report**: the files written or changed, the commands confirmed by running them, what the user decided about the git workflow, nested files proposed, and the next step (`commit-push`).

## Update mode

1. Read the current `AGENTS.md` (and nested ones, and a `CLAUDE.md` if any).
2. **Check it against the repo**, as in step 3: commands that no longer exist or changed, paths that moved, conventions the code now contradicts, CI rules added or removed, a branching model that no longer matches the history.
3. **Ask what changed** in the project since the file was written, and walk through the sections that need it (step 4–5), not the whole interview again.
4. Apply the cut, then **show the diff** — every line removed, changed and added, with the reason for each — and write only after a yes. Step 8 applies too.

## Notes

- The template (`templates/AGENTS.md`) is a checklist of sections, not a form to fill in full: a section with nothing true to say is deleted.
- Don't duplicate the README. `AGENTS.md` carries what an agent needs to work; setup prose for humans stays in `README.md`, linked from "More context".
- Nested `AGENTS.md` files apply to their subtree (the nearest one wins), so a monorepo's root file stays about what's shared.
