# Rever um relatório em LaTeX só com sugestões

O equivalente das alterações controladas do Word é o pacote `changes`: as sugestões ficam no código, aparecem a cores no PDF e cada uma pode ser aceite ou recusada. O original nunca é tocado.

## Princípios

- Trabalhar numa **cópia do projeto inteiro** (`<pasta>-revisao/`), porque os `\input` e `\include` apontam para os ficheiros da própria pasta. Um único `.tex` copia-se para `<nome>.revisao.tex`.
- Copiar também o `.bib`, as imagens e a classe, para o PDF compilar na cópia.
- Nenhuma alteração fora das macros abaixo. Se não der para marcar, vira `\comment`.
- Nada de caminhos do utilizador nas marcas.

## Marcas

Pacote `changes`, uma linha no preâmbulo da cópia, com o marcador no fim para ser removida depois:

```latex
\usepackage[final]{changes} % reports-review
```

Se o documento já usar o pacote com outras opções, reutilizar a linha existente e não duplicar. Se a classe não deixar carregar o pacote, usar o ficheiro de revisão em Markdown (ver o fim).

| Macro | Uso |
| :--- | :--- |
| `\replaced[id=C]{novo}{antigo}` | substituição |
| `\added[id=C]{novo}` | inserção |
| `\deleted[id=C]{antigo}` | remoção |
| `\comment[id=C]{[Sugestão] regra e motivo}` | nota sem alterar o texto |
| `\highlight[id=C]{trecho}` | realce de um trecho |

- Os espaços ficam **dentro** das chaves. Rejeitar tudo tem de devolver o original ao caractere: `\added{curta }`, não ` \added{curta}`.
- O texto dos comentários começa por `[Erro]`, `[Sugestão]` ou `[Dúvida]`, com a regra e o motivo numa linha, e a origem quando a ideia vem de uma análise externa.
- Não marcar dentro de matemática, `verbatim`, `lstlisting`, argumentos de `\cite`, `\ref`, `\label`, `\input`, nem nos comentários `%` do autor. Comentar ao lado.
- Cada macro com chavetas equilibradas e sem partir comandos a meio (`\textbf{...}` fica inteiro dentro do argumento).

## O que verificar em LaTeX

- `\caption` da tabela por cima da tabela e da figura por baixo da figura (posição do `\caption` dentro do ambiente).
- Todas as chaves de `\cite{}` existem no `.bib`, e todas as entradas do `.bib` usadas estão citadas. Sem referências inventadas.
- Cada `\label` tem `\ref` e cada `\ref` tem `\label` (referências cruzadas partidas aparecem como `??`).
- Índice, lista de figuras e lista de tabelas: confirmar que o documento as gera (`\tableofcontents`, `\listoffigures`) e compilar duas vezes.
- Maiúsculas e minúsculas e acentos em chaves do `.bib`, para o estilo de referências pedido.

## Verificação antes de entregar

1. `python scripts/tex_changes.py check <original> <cópia>` para cada ficheiro alterado: rejeitar tudo tem de devolver o original.
2. Compilar a cópia, se houver compilador, e confirmar que não há erros novos.
3. Dizer ao utilizador como decidir:
   - tudo de uma vez: `python scripts/tex_changes.py accept <ficheiro> -o <saída>` (ou `reject`);
   - uma a uma: editar a macro à mão, ficando com o argumento que quer.

   Ao aceitar, a linha do preâmbulo com `% reports-review` é removida.

## Quando não dá para usar o pacote

Escrever `<nome>.revisao.md` ao lado, com cada sugestão por ordem de aparição: ficheiro, linha, antes, depois e motivo. O utilizador aplica à mão.
