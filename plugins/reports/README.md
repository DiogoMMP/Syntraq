# `reports` — Relatórios académicos

Parte do [Syntraq](../../README.md) — *Power up your agents*.

Relatórios académicos (estágio, tese, trabalhos de cadeira), em Word ou LaTeX: começar a partir do teu template, escrever secções e rever. A regra de ouro: **nunca escrevem diretamente no teu texto**. Tudo chega como sugestão e comentário, e és tu a aceitar ou recusar.

## Instalação

```text
/plugin marketplace add DiogoMMP/syntraq
/plugin install reports@syntraq
```

## Skills

| Skill | Onde usas | O que faz |
| :--- | :--- | :--- |
| [`report-new`](skills/report-new/SKILL.md) | Fora do Word | Começa um relatório a partir do teu template: capa, logos certos, esqueleto dos capítulos e referências |
| [`report-improve`](skills/report-improve/SKILL.md) | Fora do Word | Escreve ou desenvolve secções, como sugestão, a partir do relatório, da KB e dos ficheiros que indicares |
| [`report-improve-word`](skills/report-improve-word/SKILL.md) | Dentro do Word | O mesmo sobre o documento aberto (também preenche um template aberto no Word) |
| [`report-review`](skills/report-review/SKILL.md) | Fora do Word | Revê um `.docx` ou projeto LaTeX no disco, com a tua KB e perfil |
| [`report-review-word`](skills/report-review-word/SKILL.md) | Dentro do Word | Revê o documento aberto, por exemplo um ficheiro partilhado no Teams |

**Qual uso?** Dentro do Word, as `-word`. Fora do Word (Claude Code ou Desktop), as outras: são as que veem a tua KB, o perfil, o template no disco e o LaTeX. Se usares a errada, ela diz-te qual é a certa.

**Fluxo típico:** `report-new` para começar, `report-improve` (ou `-word`) para escrever, `report-review` (ou `-word`) antes de entregar.

Todas usam a mesma [lista de verificações](references/checklist.md) e as mesmas [regras](references/regras-academicas.md). Só a `report-new` escreve diretamente, e só num documento novo (capa e esqueleto); as outras só sugerem.

## `report-new`

- Copia o teu template (`.docx`, `.dotx` ou projeto LaTeX) para um ficheiro novo; o template não é alterado.
- Preenche a capa e confirma os logos: se não forem da tua instituição e curso, retira-os e pede-te os certos.
- Põe os capítulos (do enunciado ou da estrutura típica) com notas `[A preencher]`, nunca texto inventado.
- Referências: pergunta o estilo (IEEE por omissão); com Mendeley deixa a bibliografia ao Mendeley Cite; em LaTeX prepara o `.bib`.

## `report-improve`

- Introdução (problema, objetivos SMART, questões, cronograma, metodologia, uso ético de IA), estado da arte, mapeamento de requisitos, justificação técnica, conclusão, resumo, legendas.
- Tudo como sugestão numa cópia, com comentário a dizer em que se baseia. O que falta (números, datas, decisões) fica como `[Dúvida]`.
- Cada facto de uma fonte leva citação; nunca inventa fontes. Fontes novas para o estado da arte só como sugestão, com o DOI confirmado.

## `report-review`

- Funciona com **Word e LaTeX**. Trabalha sempre numa **cópia**; o original não é tocado.
  - `.docx`: alterações controladas e comentários, que aceitas ou recusas no Word.
  - LaTeX: copia o projeto inteiro e marca com o pacote `changes` (`\replaced`, `\added`, `\deleted`, `\comment`), que aparece a cores no PDF. Aceitas ou recusas tudo de uma vez com [`scripts/tex_changes.py`](scripts/tex_changes.py), ou uma a uma à mão.
  - PDF: só leitura, com a revisão num ficheiro à parte.
- Regras, por esta ordem: o que pedes no momento, as regras do teu perfil (orientador, curso), o que encontra na tua base de conhecimento, e as [regras académicas por omissão](references/regras-academicas.md).
- Análises de outras IAs ou de colegas são verificadas contra o texto e entram como sugestão com a origem indicada. Nunca como ordem.
- No fim verifica que rejeitar tudo devolve o original e **desliga o "Restringir edição"**.
- Não inventa referências e nunca refere ficheiros locais teus.

## Perfil

Nada pessoal fica neste repositório. Instituição, curso, estilo de referências, template e regras do orientador ficam no teu `AGENTS.md` ou na tua base de conhecimento (chaves `reports.<campo>`). Ver [`perfil.md`](references/perfil.md).

## `report-review-word`

- Corre na extensão do Claude para Word, com a tua conta Claude, seja qual for a conta Microsoft do documento.
- Só vê o documento aberto: nada de KB nem disco. As regras do trabalho colam-se na mensagem.
- Alterações controladas e comentários nativos do Word.
- Não consegue desligar o "Restringir edição" por ti: lembra-te de o fazer em Rever, Restringir Edição, Parar Proteção.
- As skills `-word` são autónomas: têm cópias das regras e da lista na própria pasta. Depois de mudar algo em `references/`, corre `python plugins/reports/scripts/sync_word_skill.py` (com `--check` só confirma).
