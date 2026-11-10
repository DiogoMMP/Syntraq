---
name: clean-architecture
description: "Scaffold a new project onto a Clean Architecture layout (Domain / Application / Infrastructure / Api / optional CrossCutting), or audit and retrofit an existing one, in any stack, using that stack's own idioms instead of a .NET template. Asks the structural questions first (CQRS, one service or several, database and migrations, Docker, background jobs, auth, test scope), then shows the planned tree and scaffolds it, or maps every existing file to its layer, shows the move/rename plan and executes it after one approval. Never touches docs/ and never commits, pushes or opens a PR. Use when the user wants Clean Architecture, DDD layering or hexagonal/ports-and-adapters, or a codebase reorganised to respect layer boundaries — e.g. 'cria a estrutura clean architecture', 'organiza este projeto em clean architecture', 'separa isto em domain/application/infrastructure', 'scaffold clean architecture', 'this needs proper layering'."
allowed-tools: ["Bash", "Read", "Write", "Edit", "Grep", "Glob", "AskUserQuestion", "WebFetch", "WebSearch"]
---

# Clean Architecture — scaffold or retrofit

Sets a project onto a Clean Architecture layout — **Domain**, **Application**, **Infrastructure**, **Api/Presentation**, and an **optional CrossCutting** — or brings an existing one into line. Two modes, resolved in Phase 0:

- **New project** → Phase 3A scaffolds from scratch.
- **Existing project (retrofit)** → Phase 3B audits first, proposes one full move/rename plan, and only executes after a single bulk approval.

**Deliberately out of scope:** this skill never touches `docs/` — specs, ADRs and the personal knowledge base are `implement-change` and `knowledge-base`'s job, not this one's — and it never commits, pushes or opens a PR. Hand off to `commit-push` and `create-pr` once the structure is in place.

**Stack-agnostic by design, but not template-agnostic about the rule.** The four/five layers and the dependency rule below are the invariant. How they're realised — projects vs. folders vs. packages, which CLI scaffolds them, which tool does migrations or background jobs — comes from **the stack you are in**, resolved in Phase 2. Never impose a `.csproj`-per-layer layout on a Node or Python project just because that's the shape of the motivating example; never invent a framework convention you haven't verified.

---

## The dependency rule — the actual "clean" in Clean Architecture

```
Domain  ←  Application  ←  Infrastructure
              ↑
         Api / Presentation  (composes everything at the edge)
```

- **Domain** depends on **nothing** — no ORM types, no HTTP types, no framework, no other layer.
- **Application** depends only on **Domain**. It defines *ports* (interfaces) for whatever it needs from the outside world (persistence, clock, external services) — it never implements them.
- **Infrastructure** implements Application's ports, and may depend on **Domain + Application**.
- **Api/Presentation** depends on **Application** to run use cases, and composes concrete **Infrastructure** implementations only at the composition root (DI wiring / startup) — not by calling Infrastructure code directly from a handler or controller.
- **CrossCutting** (only if it earns its place — see Phase 1) holds shared *technical* concerns used by two or more layers that aren't Domain (a logging abstraction, a base exception type, a constants file). It never holds business logic, and Domain still doesn't depend on it if Domain doesn't need to.

This graph matters more than the folder names. A project with unconventional names but a clean dependency graph is closer to "done" than one with the textbook names and a `Domain` entity that imports an ORM attribute. Say so, loudly, whenever Phase 3B finds a violation — a misplaced file is a tidiness issue; a broken dependency direction is a correctness issue.

---

## Phase 0 — Mode and stack

- **New vs. retrofit** — is there already source code, or a manifest, in the target directory? If it's empty (or just scaffolding from another skill, e.g. a fresh `git init`), this is a new project. Otherwise it's a retrofit.
- **Detect the stack from evidence**, never from a guess: `package.json` / `pnpm-workspace.yaml` / `turbo.json` (Node/TS), `*.csproj` / `*.sln` (.NET), `pyproject.toml` / `requirements.txt` (Python), `pom.xml` / `build.gradle*` (Java/Kotlin), `go.mod` (Go), `Cargo.toml` (Rust), or whatever else is actually there. On a genuinely new project with nothing yet, ask which language/framework instead of assuming — the answer decides everything in Phase 2.
- **Read the conventions file** — `CLAUDE.md` / `AGENTS.md` / `.cursorrules` — if present. It outranks this skill on any naming or tooling choice it already records.

---

## Phase 1 — The structural decisions (ask, don't assume)

**Ask the app/solution name directly in chat** (free text — this isn't a decision with trade-offs, so don't burn an `AskUserQuestion` on it) if it isn't already obvious from the repo name or the conversation.

Then resolve the axes below. **Skip any axis evidence already answers** — an existing `docker-compose.yml` means "yes, Docker" without asking; an existing `Commands/`/`Queries/` split means CQRS is already the answer. For a genuinely new project, batch the rest into `AskUserQuestion` calls (max 4 per call), each with a recommended default sized for a small/personal project so the user can fast-path one approval instead of relitigating every axis:

1. **Scope** — one deployable service in this repo, or several (a small monorepo of services)? This decides whether Domain/Application/Infrastructure are shared across services or split per service. *Default recommendation: one service.*
2. **CQRS or plain use-cases** in Application — separate Commands/Queries handlers, or a single `UseCases/` folder when reads and writes don't genuinely diverge? *Default: plain use-cases; CQRS only once read and write models actually differ.*
3. **Persistence** — is there a database at all (a pure gateway/BFF may have none)? If yes, which engine, and which migration tool (Flyway, the ORM's own migrations, Alembic, Prisma Migrate, Liquibase, or none/manual)? *Default: the migration tool the stack's own ecosystem defaults to, unless the user already has a preference.*
4. **Containerization** — Docker for local dev? A single `Dockerfile`, or `docker-compose` with per-environment overrides (`docker-compose.override.yml` for local, one file per further environment the user actually has — name them after what the user calls those environments, don't assume "homolog" or "staging")? *Default: a single Dockerfile + docker-compose for local dev only, until there's a second environment to justify more files.*
5. **Background jobs / scheduled work** — needed at all? If yes, which mechanism for this stack (Hangfire/Quartz.NET, Celery, BullMQ, a cron container, cloud scheduler, …)?
6. **Auth** — needed at this layer, or handled upstream (gateway, BFF)? If needed, which mechanism (JWT, OAuth/OIDC, session)?
7. **Test scope beyond unit tests** — integration tests? End-to-end? *Default: unit tests now, integration tests added when there's infrastructure worth testing against.*
8. **CrossCutting** — is there real shared *technical* code, used by two or more layers, that isn't Domain (logging abstraction, base exceptions, constants)? Only create the layer if yes — an empty `CrossCutting` folder kept "just in case" is noise, same as an empty section in a written record.

Record the answers; Phase 2 and Phase 3 both key off them, and Phase 4's report restates them so the user can sanity-check what was assumed vs. decided.

---

## Phase 2 — Resolve the stack's own idiomatic realisation

Translate the layers into what this stack's ecosystem actually does, not a transliteration of another stack's shape. Verify conventions you aren't certain of (`WebFetch`/`WebSearch` against the framework's own docs or starter template) rather than guessing — a wrong convention is worse than asking.

| Stack | Realisation |
| :--- | :--- |
| **.NET (C#)** | One project per layer under `src/`, wired with `ProjectReference`s that enforce the dependency rule: `<App>.Domain` (zero deps) ← `<App>.Application` ← `<App>.Infrastructure`; `<App>.Api` (Program.cs, minimal API endpoints or controllers, `appsettings*.json`, `Dockerfile`) references `Application` and composes `Infrastructure` in `Program.cs`/DI extension methods. `<App>.CrossCutting` only if Phase 1 calls for it. Tests as `<App>.UnitTests` / `<App>.IntegrationTests` under `tests/`. A `.sln` ties it together. CQRS (if chosen) via a mediator library, `Application/Commands` + `Application/Queries`, pipeline behaviors under `Application/Common` (validation, logging, retry, transaction). Migrations under `Infrastructure/Persistence` (ORM) or `Infrastructure/Database/Scripts` + a `flyway.conf` / `DockerfileFlyway` (Flyway). |
| **Node / TypeScript** | Single service, one package: `src/{domain,application,infrastructure,api}` folders, same dependency rule enforced by import discipline (lint rule or dependency-cruiser, not just convention) since there's no compiler-enforced project boundary. Multiple services or shared libraries → a workspace (`pnpm`/`turborepo`/`nx`): `packages/{domain,application,infrastructure}` + `apps/api`, dependencies declared in `package.json` so the workspace tool enforces the graph. CQRS via a small command/query dispatcher or just typed use-case functions. Migrations via the ORM's own tool (Prisma Migrate, Drizzle Kit, TypeORM migrations) or Flyway if the user already runs it elsewhere. |
| **Python** | `src/<app_package>/{domain,application,infrastructure,api}` — a single distributable package; use `Protocol`/ABC classes in `application/` for ports. FastAPI/Flask app + routers live in `api/`. Migrations via Alembic (SQLAlchemy) or the ORM's own tool. Background jobs via Celery/RQ/APScheduler. Tests under `tests/{unit,integration}`. |
| **Java / Kotlin** | Multi-module Gradle/Maven, one module per layer (`domain`, `application`, `infrastructure`, `api`), module `build.gradle`/`pom.xml` dependencies enforcing the direction — same shape as .NET's projects. Migrations via Flyway or Liquibase (both are first-class in this ecosystem). |
| **Go** | Idiomatic Go, not a transliteration: `cmd/<app>/main.go` as the entrypoint (Api/Presentation), `internal/{domain,application,infrastructure}` as packages — Go's own `internal/` visibility rule already enforces "nothing outside this module can import it," which is most of the dependency rule for free. Don't invent an "Api project" — `cmd/` + `internal/` *is* the Go convention. |
| **Anything else** | Same four concepts, placed at whatever root the ecosystem itself expects (usually `src/`). Confirm the layout against that ecosystem's own official guide before creating it, and say in chat what you verified it against. |

---

## Phase 3A — New project: scaffold gate

Show the **complete planned tree** — every directory and the key files in each (project/package manifests, `Dockerfile`(s), `docker-compose*.yml` if chosen, the solution/workspace file) — in chat. **Wait for approval before creating anything.**

Once approved:

- **Prefer the stack's own scaffolding CLI over hand-written project files** — `dotnet new classlib`/`webapi`, the workspace tool's own `create`/`init`, `poetry new`/`uv init`, `go mod init` — so every generated project actually builds on the first try. Adapt afterwards: wire cross-project references, delete default template stubs (`Class1.cs`, `WeatherForecast`, …), set up the composition root.
- **Wire the dependency direction for real**, not just via folder names — `.NET` `ProjectReference`s, workspace `dependencies`, Python imports, Go's `internal/` boundary. Verify afterwards that Domain has zero outward dependencies (check its manifest/imports, don't just assume the scaffold got it right).
- **Only create what Phase 1 actually asked for.** No empty `CrossCutting`, no `Commands`/`Queries` split without CQRS, no migration folder without a chosen tool, no second `docker-compose` override without a second environment to justify it.

---

## Phase 3B — Existing project: retrofit gate

1. **Map every existing source file to the layer it *should* be in**, based on what it actually does — not its current folder name:
   - Touches HTTP/request/response objects, or a UI/CLI entrypoint → **Api/Presentation**.
   - A business rule with no external dependency (no I/O, no framework type) → **Domain**.
   - Orchestrates a use case, calling out to ports it doesn't implement itself → **Application**.
   - Touches a database, filesystem, network call, message broker or third-party SDK → **Infrastructure**.
2. **Flag dependency-rule violations first and loudest** — Domain importing an ORM/HTTP type, Application referencing a concrete Infrastructure class instead of its own port, Api calling Infrastructure directly instead of through Application. These are correctness problems; surface them ahead of merely-misnamed folders, and say explicitly which rule each one breaks.
3. **Produce one plan**: every move (`from → to`), every rename, and every import/namespace path that the move will break and needs updating. Show the **whole plan** in chat as a single block — don't dribble it out file by file.
4. **Wait for one explicit bulk approval.** This repo's retrofit convention is a full plan approved once, then executed end to end — not a per-file gate like the message/PR gates elsewhere in this plugin. If the user asks to change part of the plan, revise and re-show the whole thing before executing anything.
5. **Execute**, once approved:
   - `git mv` for every move — never a plain filesystem move — so history survives.
   - Fix every import/namespace statement the moves broke. A move that leaves a broken import behind is not done.
   - Run the project's own build/typecheck (from the manifest found in Phase 0) afterwards. Fix whatever it surfaces; never leave the tree in a worse state than before the retrofit started.
6. **This is a structural refactor, not a feature.** Recommend doing it on its own branch (e.g. `refactor/clean-architecture-layout`) before anything else lands on top of it, and hand off to `commit-push` / `create-pr` once the build is green. This skill does not commit.

---

## Phase 4 — Report

Short and factual:

- **The tree produced**, or **the move plan executed** (from → to, one line each).
- **Phase 1 decisions** — what was answered vs. what evidence already decided, so the user can sanity-check the assumptions.
- **Dependency-rule violations** found — which were fixed by the move, and which need a design decision beyond a mechanical move (name these explicitly; don't silently leave one unresolved).
- **Build/typecheck result**, with the baseline, for a retrofit.
- **Next step** — the work is uncommitted: `commit-push` to commit (and push), then `create-pr` to open the PR. Do not run them from here.
