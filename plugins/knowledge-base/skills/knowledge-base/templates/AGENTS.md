<!-- kb:start -->
## Knowledge base — {{TOPIC}}

This directory is a knowledge base. Before answering anything about {{TOPIC}}, use it — don't answer from memory. `KB_GUIDE.md` has the full conventions.

### How to look things up

1. **Start with the wiki.** Read `wiki/index.md`, then the articles it points to that are relevant. The wiki is the compiled, cross-linked view of the sources — it's the default place to answer from.
2. **Go to `raw/` only when the wiki isn't enough**: you need the exact wording, a figure, a table, an image, or detail the wiki summarised away. Use `wiki/sources.md` to find which raw file backs an article. Never edit anything in `raw/`. If it contains source code, that code is for consulting only: read it to answer or verify, but don't compile it into the wiki.
3. `notes/` holds the author's own thoughts and decisions, AI answers they saved, and messages from other people (`kind: message`, with `from:`). None of them is a source: thoughts are the author's view, messages are attributed to whoever wrote them, and AI-authored notes are unverified.

### Don't invent

- Ground every answer in the wiki (and `raw/` when you consulted it). Cite the article or source file you used.
- If the answer isn't in the knowledge base, you may search online or answer from general knowledge — but say explicitly that it is **not based on the knowledge base's sources**. Never present it as if it came from them, and never fill a gap with a guess.
- If sources disagree or are unclear, say so instead of picking one silently.

### Writing markdown

Write every `.md` file with **no hard line breaks inside a sentence or paragraph**: one paragraph (or list item) per line, however long. Don't wrap at 80/100 columns. The editor or viewer that opens the file adapts the line width; manual wrapping only makes diffs noisy and breaks the layout on other screen sizes. Line breaks belong only between paragraphs, list items, headings, table rows and code blocks.

### Maintenance

The wiki is maintained by the `compile-wiki` skill, not by hand, and it is the single source of truth: durable knowledge goes only there. Something worth keeping goes into `notes/` as a new note, for `compile-wiki` to fold in.

Anything produced for a purpose goes in `outputs/<area>/` (same areas as `wiki/`), in the purpose folder registered in `outputs/README.md` for what it is for (or `work/` for versioned work); a purpose with no folder yet gets one, named in the KB's language and registered there. Outputs link to the wiki articles they are based on instead of repeating them, and say what they are based on in their own frontmatter. Add one short row to the index table in `outputs/README.md` for each.

Don't assume this folder is a git repository. Never write into `raw/`, and don't expect it to follow any folder or naming convention.
<!-- kb:end -->
