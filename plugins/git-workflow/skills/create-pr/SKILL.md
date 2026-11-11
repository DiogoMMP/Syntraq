---
name: create-pr
description: "Open a pull request for the current branch, following a GitFlow-style branching strategy for personal projects. It does NOT commit and does NOT push — the branch must already be committed and pushed (use `commit-push` for that). It reads the repository's pull request template FIRST (or, when the repo has none, its own bundled default template), fills that exact template in from the real diff — in Portuguese by default — links every `docs/changes/` feature / bugfix / hotfix / fix record the branch touches, runs `code-analyst` over the diff first, links issues by target (`Closes #N` into `main`; a `Testing: #N` marker line into `develop`, never moving issues itself), appends the `🤖 Generated with [Claude Code]` line at the end, shows the complete title and body, and waits for explicit validation before running `gh pr create`. Use whenever the user wants a PR opened or its body written — e.g. 'abre o PR', 'faz o pull request', 'cria PR para develop', 'open a PR', 'write the PR description', 'PR body'."
allowed-tools: ["Bash", "AskUserQuestion", "Read", "Grep", "Glob", "Skill", "Agent"]
---

# Create Pull Request — GitFlow

**Scope — read this first.** This skill opens a pull request. That is all it does.

- It **never** stages, **never** commits, **never** amends, **never** pushes, **never** merges.
- It assumes the work is already committed **and** already pushed to `origin`.
- If it isn't, this skill **stops and says so** — the user runs `commit-push` first. Do not "help" by committing or pushing on the way; that is another skill's job and another skill's gate.

**One hard gate:** show the *fully filled-in* title and body, wait for the user's explicit OK, only then run `gh pr create`. Opening the PR in the same turn as the proposal is a failure of this skill, even if the user said "abre o PR" up front — that authorizes the *flow*, not the body they have not seen yet.

**Four rules that hold everywhere in this skill:**

- **Language — Portuguese by default.** Every word you write into the PR body goes in Portuguese, whatever the language of the chat, of the commits, or of the code — unless the template found in Step 3 is itself fixed prose in another language, in which case follow the template's language instead. No mixed-language bodies, no English summary under Portuguese headings. See Step 4.
- **No hard wraps in the body.** One paragraph or list item per line, however long — GitHub wraps it; manual breaks at 80/100 columns show up as broken sentences. Line breaks only between blocks.
- **Always link the `docs/changes/` records.** Any feature / bugfix / hotfix / fix Markdown record this branch adds or touches must be linked from the PR body. See Step 4.
- **Issues follow the target branch.** A PR into the default branch (`main`) *closes* its issues; a PR into `develop` only marks them with a `Testing: #N` line for the repo's automation to read on merge. The skill itself never moves an issue. See Step 4.

---

## Step 1 — Read the state, and refuse if the branch isn't ready

Run these in one batch (read-only, cheap):

```bash
git status --porcelain=v1 --branch
git branch --show-current
git remote -v
gh pr view --json url,state,title 2>/dev/null   # is there already a PR for this branch?
```

Then check the three preconditions. **Any of them failing stops the skill** — report it plainly and name the fix, don't perform the fix:

| Situation | What to do |
| --- | --- |
| Uncommitted changes in the working tree | Stop. List them and say they need committing first (`commit-push`). Ask whether to proceed with the PR **without** them only if the user brings it up. |
| Branch has no upstream, or `[ahead N]` unpushed commits | Stop. Say the branch must be pushed first (`commit-push`, or `git push -u origin <branch>`). |
| Detached HEAD, or on `main` / `develop` | Stop. There is no PR to open from an integration branch — GitFlow expects the PR to come *from* an auxiliary branch. |
| A PR already exists for this branch | Report its URL and state instead of creating a second one. Offer to update its body only if the user asks (see Step 5). |

With the preconditions met, read what the PR actually contains — always against the base branch resolved in Step 2, never against the working tree:

```bash
git log --oneline origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

Also read the repo's `CLAUDE.md` / `AGENTS.md` if present. **Repo-level conventions win over the defaults in this skill** (required PR sections, title pattern, base-branch policy).

The PR body must describe **the whole branch**, not just the last commit. Read every commit in that range.

---

## Step 2 — Resolve the base branch from GitFlow

| Head branch | Base (PR target) |
| --- | --- |
| `feature/<slug>` | `develop` |
| `bugfix/<slug>` | the `release/*` it branched from |
| `release/<version>` | `main` |
| `hotfix/<slug>` | `main` |
| `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `ci/`, `build/`, `perf/`, `style/`, `revert/` + `<slug>` | `develop` |

- **The repo's own workflow wins.** If `AGENTS.md` or `CLAUDE.md` states where each branch type goes (or that there is no `develop`), use that instead of this table.
- **No `develop` on the remote** (GitHub flow — check `git ls-remote --heads origin develop`): every work branch targets the repo's default branch (`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`); say so in the gate.
- Confirm the resolved base in the gate at Step 5 — **never guess it silently**.
- For a `bugfix/*`, find the parent release branch (`git branch -r --contains` on the merge base, or ask) instead of defaulting to `develop`.
- If the branch's slug leads with a number (`feature/12-dark-mode`), treat `12` as a GitHub issue and link it. This is a convenience, not a requirement — most personal-project branches carry no issue number, and that's fine; never ask the user to supply one just to fill this in.

---

## Step 2b — Run the code analyst (before drafting anything)

With the base resolved, invoke the `code-analyst` skill (via the `Skill` tool) on `origin/<base>...HEAD`. It launches specialist agents in parallel (correctness, security, tests, conventions, simplification, docs/records), verifies their findings and returns one ranked report. It is read-only — it changes nothing.

- **Show the report in chat** as it came back, then act on its verdict:
  - *Pronto para PR* → continue to Step 3.
  - *Pronto, com pontos a decidir* (verified majors) → list them and ask with `AskUserQuestion` whether to **continue to the PR anyway** or **stop to fix first**. Recommend stopping when a major is a real behaviour bug.
  - *Não está pronto* (verified blocker) → recommend stopping; continue only if the user explicitly chooses to. Never fix anything from here — fixing is another skill's job (`commit-push` for the fix commits), after which the user re-runs this one.
- **Findings the user chose to ship with** are not hidden: add them, in the body's language, as a short "Pontos conhecidos" list inside the template's description section — a reviewer should hear it from the author. Minors and nits stay in chat only.
- **Skip the analysis only if the user says so** ("abre já o PR", "sem análise"), or for a trivial diff the analyst itself reduces to its two-role minimum. Say in chat when it was skipped; the PR body never claims an analysis that did not run.
- If the `code-analyst` skill is unavailable, say so and continue; do not imitate it badly inline.

---

## Step 3 — READ THE PR TEMPLATE FIRST (mandatory, before writing any body text)

**Never write a PR body out of your own head, and never out of earlier PRs' heads.** Before drafting a single line, find the repository's pull request template and read it in full. Look, in this order, and take the first that exists:

```bash
ls .github/pull_request_template.md \
   .github/PULL_REQUEST_TEMPLATE.md \
   .github/PULL_REQUEST_TEMPLATE/*.md \
   docs/pull_request_template.md \
   .gitlab/merge_request_templates/*.md \
   PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

If several exist under `.github/PULL_REQUEST_TEMPLATE/`, pick the one matching the change type (feature / bugfix / hotfix) and say in chat which you picked.

Then `cat` it and treat its content as the **skeleton you must fill in**:

- **Keep the template's structure byte-for-byte** — same headings, same order, same emoji, same horizontal rules, same blockquotes, same language, whatever that language is; **do not translate it** and do not re-word its fixed text.
- **Do not drop sections** you consider irrelevant. Fill them with the honest answer — `N/A`, or a one-line reason — instead of deleting them.
- **Do not add sections** the template doesn't have. If the repo's `CLAUDE.md` demands extra ones (e.g. **Summary**, **Changes**, **Tests**), place them **inside** the template's description section rather than replacing the template with them.
- **Replace the HTML-comment placeholders** (`<!-- Explica o que foi feito ... -->`) with real content drawn from the diff; don't leave the comments in the submitted body.
- **Tick a change-type box** (`- [x] Feature 🚀`) according to the branch prefix and what the diff actually does.
- **Tick a checklist box only for something you actually verified in this session** — a build you ran, tests you saw pass, a manual check you performed. Leave the rest unticked; never tick a box just to make the PR look complete. Say in chat which ones you left unticked and why, so the user can tick them after checking.
- **Hotfix sync checklist:** when the template has one and the PR is a `hotfix/*` or targets `main`, it is mandatory — fill it honestly rather than skipping it. When the repo has no `develop` (GitHub flow), the sync-with-`develop` items can't apply: leave them unticked and answer each with "N/A — the repository has no `develop`" (in the body's language), instead of ticking or deleting them.
- **If the repo has no template**, go straight to this skill's own default, [`templates/PULL_REQUEST_TEMPLATE.md`](templates/PULL_REQUEST_TEMPLATE.md), and say in chat that the repo has none and this one was used. **Do not look at previous PRs** (`gh pr list`, `gh pr view` on merged or closed ones, the git history's merge commits) to infer a format and imitate it — the bundled template is the format, always, even when earlier PRs in the repo were written differently. Fill it under every rule above, with one adaptation: its review checklist names `npm` commands (`npm run build`, `npm test`) — replace them with the repo's own build and test commands, found from its manifests, scripts and CI (`dotnet build`, `pytest`, `mvn verify`…), or drop the parenthetical when there is none; never leave a command the repo doesn't have. If the repo's `CLAUDE.md` requires extra sections (e.g. **Summary**, **Changes**, **Tests**), put them inside the template's `## 📋 Descrição` section. Don't add the template to the repo — offer to, and only on a yes create `.github/PULL_REQUEST_TEMPLATE.md` as a separate change for `commit-push` (this skill never commits).

---

## Step 4 — Compose the title and body

**Title** — Conventional Commits shape: `fix(auth): reject forged logout navigations`. Check whether this change has an associated GitHub issue — derived from the branch slug (e.g. `feature/12-dark-mode` → `#12`) or mentioned anywhere in the conversation. **If one exists, it must be referenced** — in the title (`(#12)`) or, failing that, in the body; don't drop a known issue silently. Only the *absence* of one is fine to leave as-is: never ask the user to open an issue just to have something to reference. If the template's own checklist names a title pattern (e.g. `[tipo]: descrição curta`), follow **that** pattern instead. Imperative mood, no trailing period, ≤ 72 chars.

**Body language — Portuguese by default.** Write every word you add in Portuguese (pt-PT), regardless of the language of the chat, of the commit messages, or of the code — that's the default for this user's personal projects. **Exception:** if the template you found in Step 3 is itself clearly written in another language (fixed headings and prose, not just placeholders), follow the template's own language instead so the body doesn't mix languages with its fixed text. Never produce a mixed-language body (an English *Summary* under `## 📋 Descrição` is wrong).

**Technical vocabulary stays in English** — the rule governs the prose, not the jargon. Keep as-is:

- code identifiers, class / method / property names, file paths, branch names, issue numbers, commands;
- product, tool, framework and service names actually used in the repo (whatever they are);
- established IT terms with no natural pt-PT equivalent, or whose translation would obscure the meaning for the reviewer — *endpoint*, *middleware*, *build*, *deploy*, *merge*, *rollback*, *cache*, *token*, *commit*, *branch*, *pull request*, *timeout*, *seed*, *job*, *log*;
- the `🤖 Generated with [Claude Code]` line.

Everything around them — the sentences, the verbs, the connective tissue, the checklist answers — is Portuguese. Write `Corrigido o endpoint de logout para rejeitar navegações forjadas`, never `Fixed the logout endpoint…` and never a laboured `ponto de extremidade`.

If the user explicitly asks for a PR body in another language for a given PR, that request wins for that PR — the Portuguese default doesn't override an explicit instruction.

**Body content** — describe intent, not a file listing. Say *why* the change exists, what a reviewer should look at, and anything non-obvious (trade-offs, follow-ups deliberately left out, migration or deploy steps). Never claim a test ran that you did not run.

### Link the `docs/changes/` records — always

This project records work as Markdown under `docs/changes/` (kept separate from any `docs/wiki/` or `docs/notes/` personal knowledge base the project might also have — see `spec-change` and `implement-change`). Every such record the branch **adds or modifies** must be linked from the PR body, so a reviewer reaches the reasoning in one click:

| Folder | Record shape |
| --- | --- |
| `docs/changes/features/FNNNN-<slug>/` | folder — link its `README.md` (or the folder itself) |
| `docs/changes/bugfixes/BNNNN-<slug>/` | folder — link its `README.md` (or the folder itself) |
| `docs/changes/hotfixes/HNNNN-<slug>/` | folder — link its `README.md` (or the folder itself) |
| `docs/changes/fixes/<YYYY-MM-DD>--<Module>--<slug>.md` | single file — link the file |

Find them from the diff, never from memory:

```bash
git diff --name-only origin/<base>...HEAD -- docs/changes/
gh repo view --json nameWithOwner -q .nameWithOwner
```

Link form — **absolute `blob` URLs on the head branch**, because relative links do **not** resolve inside a PR body (GitHub only resolves them inside files rendered from the repo):

```
- [F0004 — Dark mode toggle](https://github.com/<owner>/<repo>/blob/feature/12-dark-mode/docs/changes/features/F0004-dark-mode-toggle/README.md)
- [Fix — duplicate crypto package pin](https://github.com/<owner>/<repo>/blob/feature/12-dark-mode/docs/changes/fixes/2026-08-26--CrossCutting--duplicate-crypto-package-pin.md)
```

Rules:

- **Where:** the template's additional-information section (`## 📎 Informações adicionais` here), or wherever the repo's own template puts supplementary links — in this skill's default template, `## 🔗 Issues relacionadas`. If the template has no such section, put the list at the end of the description section — never invent a new heading for it (Step 3).
- **Link text in the body's language**, and descriptive: the record id plus what it is, not a bare filename.
- **Only records that exist.** Link exactly what the diff shows; never guess an id, a slug or a date in a filename. Verify each path resolves on disk before writing the link (SC-7 never-invent).
- **When the branch touches no `docs/changes/` record**, say so in that section in the body's language (e.g. "Sem registos em `docs/changes/` associados a este PR.") — never leave it blank, never fabricate a link to make it look complete. If the change is a defect fix and there is *no* `docs/changes/fixes/` entry, mention it in chat: the repo's convention expects one.
- Add the linked GitHub issue too when one is known or derivable; that's the minimum, not a requirement to go find one.

### Link the issues — by target branch

Collect the issues this PR concerns: the number in the branch slug, any `#N` / issue URL in the commits (`git log origin/<base>..HEAD --format=%B`), in the `docs/changes/` records the branch touches, and in the conversation. **Only issues that exist** (`gh issue view N`) — never guess a number. Then the wording depends on where the PR goes:

| PR target | In the body (issues section) | What happens on merge |
| --- | --- | --- |
| The repo's **default branch** (`main`; and any repo with no `develop`, where every work branch targets it) | Closing keyword, one per line: `Closes #12` (`Fixes` for a bugfix/hotfix is equally fine). | GitHub closes the issue. |
| **`develop`** (or any other non-default branch) | One marker line, exactly `Testing: #12, #13` (the word `Testing:` followed by the issue numbers, comma-separated; one line for all issues). **Never** `Closes` / `Fixes` / `Resolves` — the issue must stay open until the code reaches `main`. | A GitHub Action in the repo, if it has one, reads that line and moves the issues to Testing. |

- **Also keep closing keywords out of the title and out of the body's free text** when targeting `develop` — the "Usa `Closes #123`…" comment in the template is replaced, not followed. If a commit message in the range carries `Closes #N`, mention it to the user (it only takes effect on the default branch, so it is harmless on a `develop` PR, but it will fire later if that commit is cherry-picked or released to `main` — that is the intended close).
- **A `release/*` → `main` PR** closes nothing new on its own; it lists the issues that the release carries with `Closes #N` only if they are still open and the user confirms in the gate. When in doubt, ask rather than close.

**This skill never moves an issue.** Testing happens **on merge**, not when the PR is opened, and it is done by the repo's own automation: the `Testing: #N` line is the contract. The skill only writes that line.

- **Check whether the repo has the Action:** `grep -rl "Testing:" .github/workflows/ 2>/dev/null`. If none matches, still write the line, but say in the gate and in the report that the repo has no workflow reading it, so the issues must be moved to Testing by hand after the merge. Do not offer to move them, do not touch labels, project statuses or the issues themselves, and do not create the workflow (offer it only if the user asks — it would be a separate change for `commit-push`).
- **One line, once.** The marker line appears a single time in the body, in the issues section, never in the title.

**Last line** — after everything the template produced, separated by a blank line:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Rules for that line — non-negotiable:

- **Exactly one** per PR body. Never duplicate it, never strip it.
- It goes at the **very end**, after the whole template.
- Verbatim, including the emoji and the markdown link. No variations, no extra wording.
- If you are editing an existing PR body that already has it, keep the one that is there rather than appending a second.

---

## Step 5 — PR GATE: show the filled body, wait, then open it

Print in chat, verbatim:

- the **base ← head** branches,
- the **title**,
- the **complete body** in one fenced block, exactly as it will be submitted (filled template + the Generated line),
- the commits the PR will carry (`git log --oneline origin/<base>..HEAD`),
- the **issues**: which ones, and whether they will be **closed on merge** (`Closes`, base = default branch) or **marked for Testing** (`Testing: #N`, base = `develop`) — saying whether the repo has a workflow that reads that line, or that they will need moving by hand,
- the code analyst's verdict and any findings the user chose to ship with.

Then ask for validation with `AskUserQuestion` ("Abro o PR assim?" → **"Sim, abre o PR"** / **"Não, quero alterar"**) and **end the turn**. Do not run `gh pr create` in this turn.

Accept edits: if the user changes the title, the body, the base or a checkbox, re-show the revised proposal and wait again.

On approval, open it with a heredoc so the markdown survives intact:

```bash
gh pr create --base develop --head feature/12-dark-mode \
  --title 'fix(auth): reject forged logout navigations (#12)' \
  --body-file - <<'PRBODY'
...filled template...

🤖 Generated with [Claude Code](https://claude.com/claude-code)
PRBODY
```

- Never `--fill` (it bypasses the template) and never `--draft` unless the user asks.
- Do not add reviewers, labels, milestones or assignees unless the user asks or `CODEOWNERS` / repo convention applies them automatically.
- **Never merge the PR**, and never approve it. Opening it is where this skill stops, even if the user said "e faz merge" — merging is a separate, explicitly-requested action.
- **Updating an existing PR** (only when asked): same flow — template first, show the full new body, gate, then `gh pr edit --body-file -`. Never overwrite a body a human has edited without showing the replacement first.
- If `gh` is missing or not authenticated, stop and report; hand the user the title and body so they can paste them into the web UI.

---

## Step 6 — Report

Short and factual:

- The PR URL, its title, and `base ← head`.
- The commits it carries.
- Which template checkboxes you left unticked, and why — so the user can complete them.
- Which `docs/changes/` records you linked, or that the branch touched none.
- The code analyst's verdict and what was shipped knowingly (or that the analysis was skipped, and why).
- The issues: closed on merge (`Closes`), or marked `Testing: #N` — and, when the repo has no workflow reading it, that the user moves them by hand after the merge.
- Anything you flagged in Step 1 (uncommitted changes left behind, existing PR).
