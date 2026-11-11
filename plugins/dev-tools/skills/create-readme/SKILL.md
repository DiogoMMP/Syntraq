---
name: create-readme
description: "Write or rewrite a project's root README.md from the house template (optional banner, badges, table of contents, tech stack, architecture diagram and layers, annotated layout, module map, conventions, getting started, testing, code style, observability, documentation map, contributing and branching), adapted to any stack or kind of project. Investigates the repository first and documents only what real files prove: never invents a command, version or URL, and drops the sections the project has no answer for. Configuration is documented structure-only, with nothing a secret scanner would flag. Shows the full draft and waits for approval before writing. Use when the user wants a README created, rewritten, standardised or brought up to date — e.g. 'cria o README', 'faz o readme deste projeto', 'atualiza o README', 'write the README', 'document this repo', 'standardise the readme'."
allowed-tools: ["Bash", "Read", "Grep", "Glob", "Write", "Edit", "AskUserQuestion"]
---

# Create README — house format

Produce a root `README.md` in the house format, describing **this** project and no other.

The format is a **template, not an example** — it carries no facts from any other repository, and neither should the README you produce. A .NET backend, a Next.js frontend, a Python service and a shared library each get the same skeleton, the same voice and the same tables, filled with their own facts, with the sections that do not apply **deleted** rather than faked.

References, read them when you reach the matching step:

| File | When |
| :--- | :--- |
| [`reference/template.md`](reference/template.md) | Step 5 — the fill-in skeleton, plus its deletion checklist |
| [`reference/structure.md`](reference/structure.md) | Step 4 — the canonical section list, what is mandatory, what is conditional, how each section adapts per stack |
| [`reference/style.md`](reference/style.md) | Step 5 — voice, formatting and Markdown rules |
| [`reference/badges.md`](reference/badges.md) | Step 5 — the badge wall: order, catalogue, shields.io syntax |
| [`reference/secrets.md`](reference/secrets.md) | Step 3 and Step 5 — how to document configuration without writing a credential or tripping gitleaks |

---

## Non-negotiable rules

1. **Evidence or silence.** Every version, path, port, command, table row and URL must come from a file you actually read in this repository. If you cannot prove it, leave it out — do not guess and do not approximate. Never carry a tool, a port, a naming scheme or a ticket prefix over from another project you have seen, including one earlier in this conversation.
2. **No placeholders.** A `<SLOT>` from the template, a `>>` guidance line, `TODO`, `TBD`, `<your value here>`, `XXX`, or an empty table cell — each is a failure. Either the section is documented from evidence, or it is deleted from the README.
3. **Runnable commands.** Every command in *Getting started* and *Testing* must be one you either ran, or read verbatim from a script / `package.json` / `Makefile` / CI workflow / existing doc. Use the shell the project's platform implies (PowerShell for Windows-first repos, bash otherwise) and tag the fences accordingly.
4. **No secrets, and nothing that reads as one.** Never write a credential, and never write a string a scanner would flag as one — no connection string carrying a password, no key, token, client secret or certificate body, real or invented. Read `.env` / `appsettings.*.json` / `secrets.json` for their **shape** and reproduce only the keys, with `<PLACEHOLDER>` values. Assume the repo runs **gitleaks** in pre-commit or CI, and that a README that trips it blocks every commit in the repo until someone rewrites the line. [`reference/secrets.md`](reference/secrets.md) has the safe idioms and the verification commands — read it before you write any configuration snippet.
5. **One hard gate.** Show the complete draft in chat, then wait for the user's explicit approval before writing `README.md`. "cria o README" authorises the *flow*, not the text they have not read yet.
6. **Never blind-overwrite.** If a `README.md` exists, read it fully first, mine it for facts worth keeping, and say in your proposal what you are dropping and why.
7. **Language.** Ask the user which language to write the README in — don't default to English or to any other language silently. Check the existing README, `CLAUDE.md` and `docs/` first: if they already document the project consistently in one language, offer that as the suggested option when asking (`AskUserQuestion`), but still confirm rather than assuming. Keep domain terms, enum labels and UI strings in their original language regardless of the answer.

---

## Step 1 — Locate the target

- If the user named a path, use it. Otherwise use the current working directory.
- Resolve the **repository root** (`git rev-parse --show-toplevel`); the README goes there.
- If the path is not a repository and not an obvious project root, ask which project to document before investigating.

## Step 2 — Read what already exists

Read, in full, whichever of these are present — they are the highest-value sources and usually already contain most of the README's content:

- `README.md` (existing), and any `README` under `docs/`, `database/`, `src/`
- `CLAUDE.md` / `AGENTS.md` / `.github/copilot-instructions.md` — the engineering rulebook; the *Patterns & conventions*, *Testing* and *Contributing* sections are largely a digest of this
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `docs/**/*.md`, ADRs, feature dossiers

## Step 3 — Investigate the project

Gather evidence for each section. Read manifests and config rather than inferring from folder names.

**Identity and stack**
- Manifests: `*.csproj` / `*.sln` / `global.json` / `Directory.Packages.props`, `package.json`, `pyproject.toml` / `requirements.txt`, `pom.xml` / `build.gradle`, `go.mod`, `Cargo.toml`, `Gemfile`, `composer.json`, `pubspec.yaml`
- Pin **real versions** — the runtime/SDK version and the version of every dependency you put in the tech-stack table or a badge.
- Lockfiles and `.tool-versions` / `.nvmrc` for the toolchain.

**Architecture and layout**
- The top-level tree (`git ls-files` filtered, or `ls` two levels deep) — you need it for the annotated *Solution layout* block, and every line there must be a directory that exists.
- Project references / import boundaries / workspace definitions, to get the dependency direction right in the architecture diagram. Do not draw an arrow you have not verified.

**Modules / domains**
- How the code is organised by feature: per-module folders, apps in a monorepo, routes, bounded contexts.
- Counts (entities, controllers, endpoints, routes, packages) only if you actually counted them — and say how in your proposal, so the user can sanity-check.

**Runtime surfaces**
- Ports, base paths, dev URLs: `launchSettings.json`, `appsettings*.json`, `.env.example`, `next.config.*`, `vite.config.*`, `docker-compose*.yml`, `Dockerfile`, K8s manifests, `.claude/launch.json`.
- Health/monitoring endpoints, API docs UI (Swagger / OpenAPI / GraphQL playground), dashboards.
- Read every settings file for its **key structure only**. Note which keys exist, which are required and what each one is for — never copy a value out of `.env`, `appsettings.Development.json`, `secrets.json` or a `*.local.*` file. See [`reference/secrets.md`](reference/secrets.md).

**Data**
- Migration tool and its ownership rule (who owns the schema), migration folder and naming, seeds.

**Security**
- Auth mechanism, session/token handling, authorization model (policies / roles / guards), CORS, dev bypasses.

**Jobs / async**
- Schedulers, queues, workers, cron definitions, and how they are invoked.

**Quality gates**
- Test frameworks, suite layout, naming convention, how to run a single module, coverage gates. Get the test count by running the suite only if that is cheap and safe; otherwise omit the number.
- `.editorconfig`, linters/formatters, `.pre-commit-config.yaml`, `husky`, `lint-staged`.
- CI/CD: `.github/workflows/`, `azure-pipelines.yml`, `.gitlab-ci.yml` — what actually runs on push/PR.

**Process**
- `git branch -a` and recent `git log --oneline` to infer the real branching model and commit convention, cross-checked against `CLAUDE.md` / `CONTRIBUTING.md`. Ticket-key pattern from real branch names.
- PR template under `.github/`.

Delegating this sweep to parallel `Explore` agents is fine when the repo is large — but only if the user asked for agent use, or the repo is genuinely too big to read directly.

## Step 4 — Plan the sections

Read [`reference/structure.md`](reference/structure.md), then decide the section list.

- Keep the canonical order. Drop any section you have no evidence for — an absent *Jobs* section is correct for a project with no scheduler; an empty one is a defect.
- Add a project-specific section when the project has a pillar the canonical list does not name (e.g. *Design system*, *State management*, *BFF layer*, *Packaging & release*, *Hardware protocol*). Give it the same treatment as the others: a prose lead, then a table or a tight bullet list.
- If anything material stayed ambiguous after Step 3 — and only then — ask the user with `AskUserQuestion`: one question per genuinely blocking gap, recommended default first.

**Banner.** If the existing README already shows a banner image at the top, keep it unless the user says otherwise. If not, ask with `AskUserQuestion` whether the README should open with a banner:

1. **I have an image** — ask for its path in the repo (or a URL) and use it as is.
2. **Create one** — only on this answer, design an SVG banner: the project's name, its one-line tagline (from the README, the manifest description or the user — never invented), and at most a simple mark or a few labels that are true of the project (its modules, its stack). Make two versions, `assets/banner-dark.svg` and `assets/banner-light.svg` (or the repo's existing assets folder), 1280×320, system fonts only, no external references, and an accessible `<title>`/`<desc>`. Render both and **show them to the user before using them**; only approved files are written.
3. **No banner** — the README starts with the title, as the template does.

A banner goes above the title, before the badge wall, as a theme-aware picture:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <img alt="<Project> — <tagline>" src="assets/banner-light.svg" width="100%">
</picture>
```

With a single image, a plain `<img alt="…" src="…" width="100%">` is enough. Never pull a banner from another project.

## Step 5 — Write the draft

Read [`reference/template.md`](reference/template.md), [`reference/style.md`](reference/style.md), [`reference/badges.md`](reference/badges.md) and — before writing any configuration snippet — [`reference/secrets.md`](reference/secrets.md). Fill the template in, deleting whole sections rather than stubbing them, and write the result to the scratchpad — not yet to `README.md`.

Then self-check, and fix before proposing. Start with the template's own deletion checklist, then:

- [ ] No `<SLOT>`, no `>>` guidance line, no `<!-- delete if … -->` comment survived.
- [ ] Nothing from another repository — no tool, port, prefix or path the project does not have.
- [ ] **Secret sweep** — run the grep from [`reference/secrets.md`](reference/secrets.md) over the draft, and if the repo runs gitleaks, run gitleaks over the draft too. Every hit must resolve to a `<PLACEHOLDER>`, an environment-variable name or a table row. Rewrite the line; never allowlist it.
- [ ] Every ToC entry resolves to a real heading, with a correct GitHub anchor slug.
- [ ] Every relative link points at a path that exists (verify each one) — banner images included.
- [ ] Every badge label matches the version in the tech-stack table.
- [ ] Every *Solution layout* line is a real directory or file.
- [ ] Every mermaid arrow reflects a real dependency.
- [ ] No `TODO` / `TBD` / placeholder, no empty table cell.
- [ ] No hard line breaks inside a paragraph or list item — one per line, however long; markdownlint-clean if the repo lints markdown.
- [ ] The *Getting started* path is complete: prerequisites → setup → run → surfaces → troubleshooting. Read it as a new joiner; anything you would still have to ask a colleague is missing.

## Step 6 — Propose, and wait

Post in chat:

1. The **complete draft**, verbatim, in one fenced block.
2. A short **evidence note**: which files each non-obvious claim came from (counts, versions, ports).
3. **Gaps** — what you deliberately left out and why (no scheduler, CI not readable, test count not run).
4. If replacing an existing README: what is being dropped.
5. **Any secret you found on the way** — a credential in the old README, in a tracked settings file or in a doc. Name the file and the line, say it needs rotating, and state that you did not carry it forward. Do not quote the value.

Then stop and ask for approval. Do not write the file in the same turn as the proposal.

## Step 7 — Write and report

After explicit approval:

- Write `README.md` at the repository root.
- Run the repo's own hooks against the written file where they exist — markdown lint and, above all, gitleaks (`pre-commit run --files README.md` covers both). Fix what they report by rewriting, not by allowlisting.
- Report the path, the section list, and anything the user should fill in themselves (an internal Confluence/Jira URL you could not resolve, for example) — as a follow-up list in chat, never as a placeholder in the file.

This skill does **not** stage, commit or push. `commit-push` does that.
