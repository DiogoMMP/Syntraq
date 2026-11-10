# Perfil do utilizador

O plugin não guarda nada pessoal. Tudo o que depende de quem o usa (instituição, curso, orientador, estilo de referências, template, logos) vive no projeto ou na base de conhecimento do utilizador, nunca neste repositório.

## Campos

| Campo | Para que serve |
| :--- | :--- |
| `instituicao` | Comparar com os logos e a capa do template |
| `curso` | Idem |
| `lingua` | Língua do documento (por omissão PT-PT) |
| `referencias` | Estilo (IEEE por omissão) e gestor (por exemplo Mendeley) |
| `template` | Caminho do template de relatório do utilizador |
| `regras` | Caminho de um ficheiro com regras próprias (orientador, curso) |

## Onde procurar, por ordem

1. Chaves `reports.<campo>: <valor>` no `AGENTS.md` ou no `CLAUDE.md` do projeto atual, depois no do utilizador.
2. A base de conhecimento do utilizador, se existir: feedback de outros trabalhos, regras do orientador, referências usadas antes. Procurar pelo conteúdo, sem assumir pastas nem estrutura em `raw/`.
3. Perguntar só o que ficou por saber, e oferecer guardar a resposta como chave no `AGENTS.md` (ou numa nota da base de conhecimento). Não escrever sem o utilizador aceitar.

## Regras

- Os caminhos são do utilizador e ficam onde ele os configurou. Nunca se copiam para o documento, para comentários ou para este repositório.
- Se o perfil não coincide com o template (por exemplo logos de outra instituição), sinalizar e perguntar. Na revisão, só comentar. Quem decide apagar é o utilizador.
