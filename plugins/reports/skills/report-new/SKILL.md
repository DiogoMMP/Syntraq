---
name: report-new
description: Outside Word, start a new academic report (internship, thesis, lab or course report) from the user's own template, in Word or LaTeX — copies the template with its styles, fills the cover (title, authors, course, institution, supervisor, date), checks that the template's logos belong to the user's institution and course (removes them and asks for the right ones when they don't), lays out the chapter skeleton from the assignment brief or the usual structure with guidance notes instead of made-up text, and sets up the references (asks the style, IEEE by default; Mendeley or a .bib, never links to the user's local files). Reads the template path and the profile from the user's AGENTS.md or knowledge base, asking only for what is missing. Use when the user wants to start, create or set up a report — e.g. "cria um relatório novo", "começa o relatório de estágio com o meu template", "prepara o documento para o trabalho de X", "new report from my template".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(python *), Bash(py *), Bash(find *), Bash(cp *), Bash(latexmk *), Bash(pdflatex *), AskUserQuestion
---

# New report

Starts a report from the user's template: the cover filled, the right logos, the chapter skeleton and the references set up. It writes the frame, never the content: every section holds a short note on what goes there, not invented text.

## Where to use it

- **Outside Word**, with the template on disk: this skill.
- **Inside Word**: open the template in Word and use `report-improve-word` to fill it, as suggestions.

If this skill has no file or command tools, stop and say so.

## Ground rules

- **Markdown without hard wraps** in any `.md` it writes.
- **Never overwrite a file.** The new report gets a new name; if it exists, ask.
- **The template is the user's.** It is read from the path in their profile, copied, and never changed.
- **Nothing personal in the plugin.** Paths, names and logos come from the user's files and stay there; nothing is copied into this repository, and no local path goes into the document.
- **No made-up content.** Sections get guidance notes (what goes there, from the brief or the usual structure), not filler text, quotations or references.

## Steps

1. **Load the profile** as `../../references/perfil.md` says: institution, course, language, reference style and manager, template path, own rules. Then ask only what is missing for this report: title, authors (and student numbers if the cover has them), supervisor(s), date or term, where to create it, and the assignment brief or rubric if there is one. Offer to save new profile answers.

2. **Find the template.** From `reports.template`, or ask. It may be a `.docx` / `.dotx`, or a LaTeX project (folder with the main `.tex`, class, images). If the user has none, offer a plain one in the format they choose, saying it is generic; never download a template.

3. **Check the logos.** Find the images on the cover and in the headers (in a `.docx`, the images in `document.xml` and `header*.xml`, with their names and alt text; in LaTeX, the `\includegraphics` of the title page and headers). Compare what the cover says (institution, school, course) and what the logos are with the profile.
   - They match: keep them.
   - They do not match, or it is unclear: remove them from the new report (the template stays as it was) and ask the user for their institution's and course's logos. Insert them in the same place and size when given. Never fetch logos from the web.

4. **Create the report**: copy the template to the new name and place (the whole folder for LaTeX), then:
   - fill the cover fields, keeping the template's styles;
   - replace the template's sample body with the chapter skeleton: from the brief or rubric when there is one, otherwise from the usual structure in `../../references/regras-academicas.md` (section 8), adjusted to what the template already has;
   - under each heading, a guidance note: in a `.docx` a Word comment `[A preencher]` with what goes there, in LaTeX a `% [A preencher] ...` comment. No body text;
   - keep the table of contents, lists of figures and tables, and lists of acronyms the template has.

5. **Set up the references.** If the style is not known, ask, with IEEE as the default. In Word with Mendeley, leave the bibliography to Mendeley Cite and add a note saying so. In LaTeX, create or reuse the `.bib` and set the style (`IEEEtran`, or `biblatex` with `style=ieee`, or what was asked). Never cite or link the user's local files.

6. **Verify**: the `.docx` opens (the zip and XML parse), or the LaTeX compiles twice without new errors if a compiler is there; the cover has no leftover template placeholders; the logos are the right ones or removed.

7. **Report in the chat**: where the report was created, what was filled, what is pending (logos to send, cover fields left blank, reference style), and that `report-improve` drafts sections and `report-review` reviews them, both as suggestions.
