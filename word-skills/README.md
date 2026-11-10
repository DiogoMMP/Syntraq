# `word-skills` — Skills para o Claude dentro do Word

Fora de `plugins/` de propósito: o marketplace não as deteta nem as instala. Servem para a extensão do Claude para Word (e outros suplementos do Microsoft 365), que só aceita skills carregadas na conta do claude.ai.

Cada pasta é uma skill autónoma, só com instruções e Markdown, porque o suplemento só vê o documento aberto. As regras partilhadas vêm de [`plugins/reports/references`](../plugins/reports/references) e são copiadas para o zip na altura de o gerar, por isso o zip reflete sempre o estado atual do repositório.

| Skill | O que faz |
| :--- | :--- |
| [`report-review`](report-review/SKILL.md) | Revê um relatório aberto no Word só com alterações controladas e comentários |

## Gerar o zip

Depois de um `git pull`:

```bash
python word-skills/build_zip.py report-review --out ~/Downloads
```

Se o carregamento disser que falta o ficheiro da skill, voltar a gerar com `--lowercase`.

## Usar

1. Em claude.ai: Customize, Skills, "+", "Upload a skill" e escolher o zip. Ao atualizar, voltar a carregar o novo zip.
2. No Word, abrir o documento, abrir o Claude e escrever `/` para escolher a skill.
3. A skill não vê a base de conhecimento nem o teu disco: cola as regras do trabalho na mensagem.
