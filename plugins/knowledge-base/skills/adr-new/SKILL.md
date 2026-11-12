---
name: adr-new
description: Scaffold a new Architecture Decision Record (Context/Decision/Consequences) as a note in a knowledge base's notes/ folder, ready for compile-wiki to fold into the wiki. Use when the user wants to document an architectural or technical decision, write an ADR, or record why they chose one approach over another.
allowed-tools: Write, Read, Glob, Bash(mkdir *), AskUserQuestion
---

# New ADR

Captures an architecture decision in the standard Context/Decision/Consequences shape, as a note that `compile-wiki` will later fold into the right wiki article.

## Steps

1. **Find the knowledge base.** Same discovery as `capture-note`: look for `wiki/` next to `KB_GUIDE.md` nearby, ask if not found or ambiguous.

2. **Ensure `notes/` exists**, creating it with a short `README.md` (documenting the `status: pending`/`status: compiled` frontmatter convention and that compiled notes are moved into archive subfolders) if it doesn't.

3. **Get the decision's content.** Prefer drafting from context: if the decision was just discussed in the conversation, draft the three sections yourself and show them to the user to confirm or edit before saving, rather than interrogating them field by field.
   - **Title**: short name for the decision.
   - **Context**: what problem or situation prompted this decision.
   - **Decision**: what was decided.
   - **Consequences**: trade-offs, what this rules out, follow-up work it implies.

   Ask only for whatever isn't already clear from the conversation.

4. **Write the note** to `notes/<YYYY-MM-DD>-adr-<slug>.md` (slug from the title) — at the top level of `notes/`, the inbox, never inside one of its archive subfolders:

   ```markdown
   ---
   status: pending
   kind: decision
   ---

   # ADR: <Title>

   ## Context

   <...>

   ## Decision

   <...>

   ## Consequences

   <...>
   ```

   Write the headings and the `ADR:` prefix in the KB's language (`language:` in `KB_GUIDE.md`, or the language the user is writing in) — e.g. for `pt-PT`: `# ADR: <Título>`, `## Contexto`, `## Decisão`, `## Consequências`. Frontmatter keys and `kind: decision` stay in English.

5. **Confirm** with the filename and a note that `compile-wiki` will fold it into the wiki later. If the KB has a dashboard, log it as [`references/dashboard-data.md`](../../references/dashboard-data.md) says (`event adr-new "<the decision's title>"`).

## Notes

- Write the note without hard line breaks — one paragraph or list item per line, however long; pasted text (an AI answer, a message) keeps its own line breaks.
- Don't cross-link or categorize here — `compile-wiki` does that when it runs.
- If the KB has no `notes/` concept at all (e.g. a research-mode KB with only `raw/`), still use `notes/` for ADRs — it's a reasonable addition alongside `raw/`, not exclusive to code mode.
