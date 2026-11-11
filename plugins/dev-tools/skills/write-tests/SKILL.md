---
name: write-tests
description: "Write unit and/or integration tests (service or API level, no browser E2E) for any language or stack. Asks what to target (a file, function or feature, or a coverage sweep) and which level, recommending from what the code does. Follows the project's test framework and conventions (or asks which to set up), stands up real dependencies for integration tests (Testcontainers, a docker-compose test profile, an in-process host), writes the fewest tests that prove the behaviour, runs them to prove they pass, and flags other coverage gaps without generating them. Never touches docs/, never commits, pushes or opens a PR. Use when the user wants tests written, coverage added or something tested, or asks what lacks coverage — e.g. 'escreve testes para isto', 'cria testes unitários', 'preciso de testes de integração', 'write tests for this', 'add unit tests', 'test this endpoint', 'o que falta cobrir de testes'."
allowed-tools: ["Bash", "Read", "Write", "Edit", "Grep", "Glob", "AskUserQuestion", "WebFetch", "WebSearch"]
---

# Write Tests — unit and/or integration, any stack

Writes tests for existing (or just-written) code — **unit**, **integration** at the service/API level, or both. Deliberately **not** E2E/UI browser automation (Playwright/Cypress/Selenium) — that's a different discipline with its own setup and is out of scope here.

**Deliberately out of scope:** this skill never touches `docs/` and never commits, pushes or opens a PR. When it's run as part of a larger tracked change, `implement-change`'s own Phase 3 already calls for tests in the project's existing style — this skill is what does that work, standalone or as part of that flow. Hand off to `commit-push` / `create-pr` once tests are written and passing.

---

## Phase 0 — What to target, and at which level

**Ask what to target, don't assume:**

- **Explicit target** — the user names a file, function, class, endpoint, component or feature. Use it as given.
- **Coverage sweep** — the user wants to know what's missing coverage. Do the sweep (below) first, show the gaps, then ask which of them to actually write tests for. **Never silently generate tests for an entire sweep's worth of gaps** — confirm the subset first.

### Running a coverage sweep

1. **Prefer a real coverage report over a naming heuristic.** Look for one already on disk (`coverage/`, `.nyc_output/`, `htmlcov/`, `TestResults/**/*.cobertura.xml`, `jacoco.xml`, `lcov.info`) and read it for actual uncovered files/lines. If none exists and the project's own coverage command is cheap to run, offer to run it; otherwise fall back to a heuristic.
2. **Heuristic fallback** — for each source file, look for a plausibly-named test (same name plus `.test`/`.spec`/`_test`/`Tests` suffix, colocated or under the project's test directory). List source files with no matching test as gaps, and say explicitly that this is a naming heuristic, not measured coverage — it will miss a test file that exists but doesn't exercise much, and it can't see partial coverage the way a real report can.
3. **Report the gaps found**, grouped by area, each flagged with what it touches (pure logic → likely just needs unit; touches a DB/network/filesystem → flag integration too). Then ask which to fill — "all of these", a subset, or none for now.

### Choosing the level(s)

- If the user already said which level ("testes unitários", "integration tests") — use that, don't ask again.
- Otherwise recommend based on what the target actually does: pure logic with no I/O → **unit** is enough; anything that talks to a database, another service, the filesystem or the network → **unit for its logic, integration for the seam** — recommend both and say why, then let the user confirm or narrow it.
- **Always flag adjacent gaps you notice while investigating, even outside the agreed scope** — a sibling function with no test, an error path nobody covers, a second endpoint sharing the untested code path. Say it in chat (e.g. "nota: `X` também está sem cobertura") and **do not** write tests for it unless the user extends the scope. Noticing and not fixing silently is the point — same principle as `implement-change`'s "plan the whole family, but don't quietly build outside scope."

**Gate for anything beyond a single narrow target:** a coverage sweep, or an explicit scope spanning several files/a whole module, gets a short confirmation in chat — the list of what's about to get tests — before writing anything. A single named file/function/endpoint doesn't need this; proceed straight to Phase 1.

---

## Phase 1 — Learn the project's testing conventions

1. **The conventions file** — `CLAUDE.md` / `AGENTS.md` / `.cursorrules`, if present. Outranks this skill on any tooling or style choice it already records.
2. **Detect the stack** from its manifest (`package.json`, `*.csproj`/`*.sln`, `pyproject.toml`, `go.mod`, `pom.xml`/`build.gradle*`, `Cargo.toml`, …) — never guess it.
3. **Detect the existing test framework(s)** already in use, separately for unit and integration (a project can use different tools for each). If genuinely none exist yet, ask which to set up, recommending the stack's own idiomatic default (see the table below) rather than picking your favourite.
4. **Read existing tests** — naming convention, colocated vs. a separate test directory, assertion style, fixture/mock/test-data-builder patterns, how suites are organised. Match them; a new test that reads like the ones around it is the goal, same as production code.

| Stack | Unit testing | Integration testing (service/API level, no browser) |
| :--- | :--- | :--- |
| **.NET (C#)** | xUnit / NUnit / MSTest — whichever the repo already references | `WebApplicationFactory`/`TestServer` driving real routing/DI, backed by Testcontainers for the real database, or the repo's existing integration-test project |
| **Node / TypeScript** | Jest / Vitest / Mocha | `supertest` against the real app instance (Express/Fastify/Nest), or the framework's own test client (Next.js route handlers, NestJS `TestingModule`), backed by Testcontainers or the repo's own test DB setup |
| **Python** | pytest / unittest | The framework's test client (FastAPI `TestClient`/`httpx`, Django's test client) against real routing, backed by `testcontainers-python` or the repo's own fixture setup |
| **Java / Kotlin** | JUnit5 + Mockito | Spring's `@SpringBootTest` (or the framework's equivalent) + Testcontainers for the real database/broker |
| **Go** | built-in `testing` (+ `testify` if the repo already uses it) | `net/http/httptest` for handlers, `testcontainers-go` or a real dependency in CI |
| **Rust** | built-in `#[test]` | A real HTTP client (`reqwest`) against a spun-up instance, `testcontainers-rs` for the database |
| **Frontend components (React/Vue/etc.)** | Jest/Vitest + Testing Library (React Testing Library, Vue Test Utils) — render and interact, no browser | Multiple components/hooks wired together with the network boundary faked (e.g. MSW) rather than mocking individual functions — this is the line before E2E, not across it |
| **Anything else** | Same two concepts, whatever the ecosystem's own idiomatic tool is | Same — verify against that ecosystem's official testing guide (`WebFetch`/`WebSearch`) before assuming a tool you haven't confirmed |

---

## Phase 2 — Resolve integration-test infrastructure (only when integration is in scope)

1. **Identify exactly what real dependency is involved** — a specific database, an external HTTP service, a queue/broker, the filesystem. Don't generalize "it needs infrastructure" — name it.
2. **Decide how to stand it up**, preferring what the repo already has over introducing a second pattern:
   - An **existing docker-compose test/CI profile** or existing integration-test project → reuse it.
   - **Testcontainers** (available for every stack in the table above) when Docker is available and there's no existing pattern — spins up the real engine, not a substitute.
   - An **in-process test host** (`WebApplicationFactory`, Spring's `@SpringBootTest`, a Node app instance passed straight to `supertest`) to hit real routing/DI without a deployed server.
   - An **in-memory fake** (e.g. SQLite in place of Postgres) only when a real instance is genuinely impractical — and say so explicitly, naming the fidelity gap (a fake won't catch an engine-specific query bug).
   - **Ask** when the repo shows no existing pattern and more than one option is reasonable — same "ask, don't assume" rule as everywhere else in this plugin.
3. **State the isolation strategy** — transaction rollback per test, a fresh container per suite, seed data reset between tests — so runs don't leak state into each other. Say which one and why.

---

## Phase 3 — Write the tests

**Keep the suite proportionate — every test is a recurring CI/CD cost, not a one-off.** More tests isn't automatically better coverage; it's slower pipelines and flakier suites for whoever runs them after you. Concretely:

- **Write the fewest tests that prove the behaviour**, not one per trivial input permutation. A parameterized/table test covering genuinely distinct cases is fine; five near-identical tests exercising the same code path with slightly different numbers is not — collapse them into one.
- **Don't duplicate the same check at both levels.** If a unit test already proves the business logic, the integration test for that same code path only needs to prove the *seam* works (the real query runs, the real route wires up) — it doesn't need to re-walk every branch the unit test already covers.
- **Prefer the cheaper level whenever it can prove the same thing.** Unit tests are faster and run everywhere; reserve integration tests for what only they can prove — an actual SQL dialect quirk, a real serialization boundary, an actual auth middleware — not as a heavier substitute for a unit test. This matters more for integration tests specifically: each one usually spins up a container or a real host, and that cost is paid on every CI run, for as long as the test exists.
- **Unit** — isolate the unit under test; mock/stub its dependencies via the project's own mocking pattern; one behaviour per test; cover the happy path, the edge cases, and the error paths — not just the happy path repeated with different data.
- **Integration** — exercise the real wiring through the real entry point (the actual repository against the actual database, the actual HTTP route). **Don't mock away the seam you're supposed to be proving works** — a mocked-out "integration" test is a unit test wearing a costume.
- **For a bug fix specifically**, the new test must **fail against the old code and pass against the fix** — that's what proves the bug is actually fixed, not just no-longer-triggered.
- **Never weaken production code to make a test pass**, and never write a test that encodes a bug as correct behaviour. If writing the test surfaces a real defect outside the agreed scope, stop and report it rather than quietly working around it.
- **Don't manufacture a test for behaviour that isn't there** — a pure passthrough with no logic doesn't need one; say so instead of padding a number.
- Match the surrounding test style — assertion library, naming, fixture/builder patterns — found in Phase 1.

---

## Phase 4 — Run and verify

- **Run the tests you just wrote**, using the project's own test command from Phase 1. Never claim a pass without having actually seen it.
- An unexpected failure means either the test is wrong or the code has a real defect — fix whichever it is, or stop and report if it's outside the agreed scope.
- **Run the broader suite too** when that's cheap enough, to catch a regression the new tests triggered elsewhere. If the full suite is slow, say what you ran vs. what you skipped, and why.

---

## Phase 5 — Report

Short and factual:

- **What got tests, and at which level(s)** — the files/functions/endpoints/components, one line each.
- **Framework(s) used**, and — for integration — how the real dependency was stood up.
- **Coverage gaps noticed but left out of scope** (Phase 0's flagging) — named, so the user can decide whether to follow up, now or with a fresh run of this skill.
- **Test run results** — pass/fail counts, anything skipped and why.
- **Next step** — the work is uncommitted: `commit-push` to commit (and push). Do not run it from here.
