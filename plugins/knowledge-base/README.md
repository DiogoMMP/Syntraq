# `knowledge-base` — Knowledge base pessoal

Parte do [Syntraq](../../README.md) — *Power up your agents*.

Uma knowledge base pessoal mantida por LLM, que o LLM compila numa `wiki/` em markdown, com backlinks, para ler no Obsidian. Em modo **research**, as fontes ficam em `raw/` (sem regras de estrutura) e as tuas notas numa inbox em `notes/`; em modo **code** não há `raw/`: a wiki é alimentada pelas notas em `notes/` e pelo histórico git do repositório. Tem dois modos — **research**, para muito material externo, e **code**, para o registo de decisões de um repositório de código pessoal.

## Instalação

```
/plugin marketplace add DiogoMMP/syntraq
/plugin install knowledge-base@syntraq
```

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`knowledge-base`](skills/knowledge-base/SKILL.md) | Cria a estrutura de pastas de uma knowledge base pessoal |
| [`compile-wiki`](skills/compile-wiki/SKILL.md) | Compila/atualiza a `wiki/` a partir de notas e do git |
| [`capture-note`](skills/capture-note/SKILL.md) | Grava rapidamente uma nota solta em `notes/` |
| [`adr-new`](skills/adr-new/SKILL.md) | Cria uma nota ADR de decisão arquitetural |
| [`resume`](skills/resume/SKILL.md) | Briefing para retomar um projeto pessoal parado |
| [`wiki-lint`](skills/wiki-lint/SKILL.md) | Health check da `wiki/` (links partidos, órfãos, etc.) |
| [`dashboard`](skills/dashboard/SKILL.md) | `dashboard.html` na raiz da KB, com menus: visão geral, uma página por UC, fontes, wiki, outputs e atividade |

## Em detalhe

<details>
<summary><b><code>knowledge-base</code></b> — Cria a estrutura de pastas de uma knowledge base pessoal</summary>

Cria a estrutura de pastas de uma knowledge base pessoal, em dois modos: **research** (estilo Karpathy: `raw/` + `wiki/` + `outputs/` + `tools/`, para quando há muito material externo a ingerir) ou **code** (mais leve, `wiki/` + `notes/`, pensado para repos de código pessoais, alimentado por notas soltas e pelo git log em vez de um `raw/`). Em modo research o `raw/` não tem regras de estrutura, nada assume que a pasta é um repositório git, `notes/` funciona como inbox (as compiladas são arquivadas em `notes/<área>/`) e `outputs/<área>/` divide-se por finalidade (as pastas de finalidade não vêm fixas: cada skill cria a sua, na língua da KB, e regista-a em `outputs/README.md`) e o trabalho versionado vive em pastas `vN/` — com a wiki como única fonte de verdade. Todos os templates são escritos na língua da KB. Pergunta o modo, a pasta de destino, opcionalmente se existe modelo de domínio a documentar (modo code), e se quer ligar a um vault geral partilhado (via junction `wiki/_geral`, visível no mesmo grafo do Obsidian).

→ [`SKILL.md`](skills/knowledge-base/SKILL.md)

</details>

<details>
<summary><b><code>compile-wiki</code></b> — Compila/atualiza a <code>wiki/</code> a partir de notas e do git</summary>

Faz a compilação, seguindo o modo definido no `KB_GUIDE.md`: em modo research lê `raw/`, resume e organiza em artigos por conceito; em modo code lê `notes/` (ficheiros com frontmatter `status: pending`/`compiled`) e tudo o que houver de novo no git — commits, issues e pull requests (via `gh`, se disponível) — desde o último `last_compiled_at`, e regenera sempre por inteiro `wiki/Estrutura.md` (estrutura de pastas, stack técnica, pontos de entrada e o modelo de domínio, se estiver registado). Em ambos os modos cria backlinks e mantém `wiki/index.md` atualizado — os artigos de decisão de forma incremental, a `Estrutura.md` sempre do zero — e, depois de compilar cada nota, move-a da inbox para `notes/<área>/`. Respeita o tipo de cada nota: as tuas opiniões e decisões, mensagens de outras pessoas atribuídas a quem as escreveu e respostas de IA marcadas como não verificadas.

→ [`SKILL.md`](skills/compile-wiki/SKILL.md)

</details>

<details>
<summary><b><code>capture-note</code></b> — Grava rapidamente uma nota solta em <code>notes/</code></summary>

Grava rapidamente um pensamento na inbox de `notes/` com o frontmatter certo (`status: pending` e, quando é evidente, o tipo: decisão, pergunta, resposta de IA ou mensagem de outra pessoa como o perito ou o professor), sem organizar nada — isso fica para o `compile-wiki`.

→ [`SKILL.md`](skills/capture-note/SKILL.md)

</details>

<details>
<summary><b><code>adr-new</code></b> — Cria uma nota ADR de decisão arquitetural</summary>

Cria uma nota estilo ADR (Contexto/Decisão/Consequências) em `notes/`, útil para documentar uma decisão arquitetural no momento em que é tomada.

→ [`SKILL.md`](skills/adr-new/SKILL.md)

</details>

<details>
<summary><b><code>resume</code></b> — Briefing para retomar um projeto pessoal parado</summary>

Briefing só de leitura: lê `wiki/Estrutura.md` (ou `index.md`), notas pendentes, e atividade git recente (incluindo alterações por commitar), e resume "onde ficaste" com sugestão de próximo passo.

→ [`SKILL.md`](skills/resume/SKILL.md)

</details>

<details>
<summary><b><code>wiki-lint</code></b> — Health check da <code>wiki/</code> (links partidos, órfãos, etc.)</summary>

Health check da `wiki/`: links partidos, artigos órfãos (não referenciados no `index.md`), referências desatualizadas a ficheiros/decisões que já não existem, entradas soltas em `wiki/sources.md`/`notes/`, notas fora do sítio (compiladas na inbox ou pendentes no arquivo), outputs fora da estrutura ou sem linha no índice, e conteúdo repetido entre `outputs/` e a wiki. Reporta primeiro, só corrige o que for aprovado.

→ [`SKILL.md`](skills/wiki-lint/SKILL.md)

</details>

<details>
<summary><b><code>dashboard</code></b> — <code>dashboard.html</code> na raiz da KB: visão geral, uma página por UC, fontes, wiki, outputs e atividade</summary>

Monta o dashboard de uma KB em modo research: um `dashboard.html` na raiz que abre com duplo clique, offline, com as cores e o logo do Syntraq e menus. Tem estas páginas:

- **Visão geral**: os próximos exames, próximos passos com um botão para copiar o pedido para o Claude, as tarefas de hoje, um mapa de calor do ritmo de estudo e o que falta;
- **Uma página por UC**: contagem decrescente, prioridades com links para o Obsidian, notas estimadas com tendência e nota mínima, o plano, o material, as fontes e a wiki da UC;
- **Fontes, Wiki, Outputs e Atividade**.

Tudo o resto vive em `.dashboard/`, uma pasta que o Obsidian ignora:

- `data/settings.json` tem as decisões deste skill (áreas, exclusões, o tema);
- `data/courses/<uc>/*.json` é escrito pelos skills de estudo;
- `data/activity/` tem um ficheiro por evento, que cada skill regista com `python .dashboard/dashboard.py event …`;
- `data.js` é o snapshot que a página lê, refeito a cada evento.

Assim o dashboard mantém-se atualizado sozinho. Este skill só volta a ser preciso na primeira vez, depois de uma atualização do plugin ou quando aparecem pastas ou UCs novas. Decide tudo sem fazer perguntas. O que não encontra (uma data de exame, a nota mínima) aparece como cartão "em falta", com o pedido pronto a copiar.

No Chrome ou no Edge, o botão "Ligar à pasta da KB" põe a página a contar o `raw/` ao vivo e a guardar o tema no ficheiro. Se o `raw/` for uma junction, a página pede para ligar também a pasta real dele.

Exemplo com uma KB de demonstração (dados fictícios):

| Visão geral | Página de uma UC |
| :---: | :---: |
| ![Visão geral do dashboard](assets/dashboard-overview.png) | ![Página de uma UC](assets/dashboard-course.png) |
| **Outputs** | **Atividade** |
| ![Outputs por pasta e tipo](assets/dashboard-outputs.png) | ![Ritmo de estudo e atividade dos skills](assets/dashboard-activity.png) |

→ [`SKILL.md`](skills/dashboard/SKILL.md)

</details>

## Créditos

- A abordagem `raw/` → `wiki/` compilada por LLM é a descrita por [Andrej Karpathy](https://x.com/karpathy/status/2039805659525644595) na nota ["LLM Knowledge Bases"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — a inspiração original deste plugin.
