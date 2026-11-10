# `reports` — Relatórios académicos

Parte do [Syntraq](../../README.md) — *Power up your agents*.

Revisão de relatórios académicos (estágio, tese, trabalhos de cadeira), em Word ou LaTeX. A regra de ouro: **nunca escreve diretamente no texto**. Tudo chega como sugestão e comentário, e és tu a aceitar ou recusar.

## Instalação

```text
/plugin marketplace add DiogoMMP/syntraq
/plugin install reports@syntraq
```

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`report-review`](skills/report-review/SKILL.md) | Revê um relatório só com sugestões e comentários |

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

## Usar no Word (documentos partilhados no Teams)

A extensão do Claude para Word trabalha no documento aberto, com a tua conta Claude, sem depender da conta Microsoft. Usa uma versão à parte da skill, autónoma, que vive em [`word-skills/`](../../word-skills/README.md), fora dos plugins para o marketplace não a instalar. O zip gera-se a partir do repositório com `python word-skills/build_zip.py report-review`; os passos estão lá.

Não consegue desligar o "Restringir edição" por ti: fá-lo em Rever, Restringir Edição, Parar Proteção.
