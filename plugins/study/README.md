# `study` — Estudo

Parte do [Syntraq](../../README.md) — *Power up your agents*.

Skills de estudo que trabalham por cima de uma knowledge base em modo research (criada pelo [`knowledge-base`](../knowledge-base/README.md)): leem o que está em `raw/` — slides, livros, fichas, exames antigos, sem impor nenhuma estrutura — e na `wiki/`, escrevem o conhecimento na wiki e o material de estudo numa pasta de finalidade de `outputs/<cadeira>/` (o nome não vem fixo: é registado no `outputs/README.md` da KB, na língua dela — por exemplo `estudo/`).

## Como se ligam

1. **`exam-map`** lê os exames antigos e escreve na wiki o que sai, com que peso, e um catálogo de perguntas reais — a base de tudo o resto.
2. **`teach`** explica-te uma parte da matéria no chat, como um professor; **`study-summary`**, **`exam-sheet`**, **`flashcards`** e **`quiz`** dão a matéria com mais espaço ao que mais sai.
   - O `study-summary` e o `exam-sheet` acabam com o **`coverage-check`**: um agente que só viu o documento tenta os exames antigos e o que não conseguir responder é acrescentado a partir da KB.
3. **`mock-exam`** e **`solve-exam`** treinam o exame: simulados no formato real e resoluções só com a matéria da cadeira.
4. **`correct-attempt`** corrige as tuas tentativas e mantém o registo de pontos fracos, que o `quiz`, o `mock-exam`, o `study-summary` e o `study-plan` usam.
5. **`study-plan`** junta tudo num calendário até aos exames.

Se a KB tiver um dashboard (o skill [`dashboard`](../knowledge-base/README.md) do plugin knowledge-base), cada skill regista no fim o que fez. O `exam-map`, o `correct-attempt`, o `quiz` e o `study-plan` escrevem também os dados da UC: tópicos e pesos, estado de cada tópico, notas, datas de exame e nota mínima. Assim, a página de cada UC no dashboard atualiza-se sozinha ([`references/dashboard.md`](references/dashboard.md)).

## Instalação

```text
/plugin marketplace add DiogoMMP/syntraq
/plugin install study@syntraq
```

O material para imprimir (resumos, simulados, resoluções) é gerado em Word e PDF com o [pandoc](https://pandoc.org) e o Microsoft Word (ou o LibreOffice) — as skills perguntam antes de instalar o pandoc. Os flashcards exportam para o ficheiro de texto do Anki sem instalar nada, ou para `.apkg` com o `genanki`.

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`exam-map`](skills/exam-map/SKILL.md) | Mapeia o que sai nos exames de uma cadeira |
| [`teach`](skills/teach/SKILL.md) | Faz de professor no chat e explica uma parte da matéria |
| [`study-summary`](skills/study-summary/SKILL.md) | Escreve um resumo completo para imprimir, em Word e PDF |
| [`exam-sheet`](skills/exam-sheet/SKILL.md) | Faz a folha de consulta para o exame: duas colunas, letra pequena |
| [`coverage-check`](skills/coverage-check/SKILL.md) | Verifica se um resumo ou folha chega para os exames e acrescenta o que falta |
| [`mock-exam`](skills/mock-exam/SKILL.md) | Cria simulados de exame com enunciado e correção separados |
| [`solve-exam`](skills/solve-exam/SKILL.md) | Resolve exames e fichas só com a matéria da cadeira |
| [`correct-attempt`](skills/correct-attempt/SKILL.md) | Corrige as tuas tentativas e regista os pontos fracos |
| [`quiz`](skills/quiz/SKILL.md) | Tutor no chat que te faz perguntas, focado nos pontos fracos |
| [`flashcards`](skills/flashcards/SKILL.md) | Cria flashcards para o Anki |
| [`study-plan`](skills/study-plan/SKILL.md) | Faz o plano de estudo, dia a dia, até aos exames |

## Em detalhe

<details>
<summary><b><code>exam-map</code></b> — Mapeia o que sai nos exames de uma cadeira</summary>

Descobre os exames antigos em `raw/` pelo caminho, nome e conteúdo (exames, exame modelo, testes e resoluções), mostra a lista para confirmares na primeira vez, lê-os (com OCR quando são digitalizados) e classifica cada pergunta pelos artigos da própria wiki. Escreve na `wiki/` um artigo de exames — formato, tabela tema × exame com o peso de cada tema, ranking 🔥/⚠️/📎, tendências, tipos de pergunta, perguntas repetidas, estilo do professor e prioridades de estudo marcadas como interpretação — e um catálogo de perguntas com ids estáveis, de onde as outras skills de estudo tiram perguntas reais. Atualiza o artigo de avaliação que já exista em vez de criar outro, regista os exames em `wiki/sources.md`, é incremental (só lê exames novos) e assinala análises repetidas em `outputs/`.

→ [`SKILL.md`](skills/exam-map/SKILL.md)

</details>

<details>
<summary><b><code>study-summary</code></b> — Escreve um resumo completo para imprimir, em Word e PDF</summary>

Faz o resumo de uma cadeira, de um bloco ou de alguns temas a partir da `wiki/`, do detalhe em `raw/` (slides, livros, fichas, resoluções) e do mapa de exames, com espaço proporcional ao peso de cada tema nos exames: definições, fórmulas (equações nativas do Word), métodos passo a passo, exemplos resolvidos e erros comuns, com figuras recortadas dos PDFs de `raw/` (gráficos, esquemas) e diagramas Mermaid na horizontal onde ajudam, tabelas com grelha, cabeçalho a cor e linhas alternadas, tudo centrado (o `mmdc` é opcional — pergunta antes de instalar), sem poluição de exames e **sem fontes** no documento. As perguntas reais de exame de cada tema (com o peso, a faixa e onde ler no resumo) vão para um documento à parte em markdown, o mapa de exames. Mostra o índice para aprovação antes de escrever, no fim chama o `coverage-check` para garantir que os exames antigos se conseguem fazer só com o resumo (acrescentando o que faltar), guarda uma pasta por âmbito sem data no nome (`estudo/resumo-<âmbito>/`) só com o Word, o PDF e o mapa de exames (sem `.md` do resumo), com a versão e a data na capa e no rodapé, e renderiza com pandoc e Word — se o pandoc não estiver instalado, pergunta se o deve instalar.

→ [`SKILL.md`](skills/study-summary/SKILL.md)

</details>

<details>
<summary><b><code>teach</code></b> — Faz de professor no chat e explica uma parte da matéria</summary>

Dá a matéria como o professor da cadeira: pergunta o que já sabes do tema e começa daí, e explica em pedaços pequenos, na notação e na linguagem da própria cadeira — porque importa e onde encaixa, a intuição, as definições e fórmulas, o método com um exemplo resolvido em voz alta (de preferência uma pergunta real de exame) e as armadilhas em que se cai. Depois de cada pedaço faz uma pergunta curta para ajustar o ritmo: se erras, volta atrás e explica de outra maneira; se acertas depressa, avança. No fim propõe um exercício no estilo do exame, faz um resumo de três a cinco linhas e diz para onde ir a seguir (`quiz`, `flashcards`, `study-summary` ou `exam-sheet`). Tudo vem da `wiki/` e do `raw/` (o que vem do conhecimento geral é dito), as contas são verificadas a correr, e nada é guardado — uma aula não é um output.

→ [`SKILL.md`](skills/teach/SKILL.md)

</details>

<details>
<summary><b><code>exam-sheet</code></b> — Faz a folha de consulta para o exame: duas colunas, letra pequena</summary>

Faz a folha que levas para o exame (ou para a última revisão): páginas em duas colunas, letra pequena (7,5 pt por omissão, margens estreitas, sem capa nem índice) e conteúdo telegráfico — definições numa linha, fórmulas, regras, tabelas, métodos em passos, exemplos e armadilhas de uma linha — para caber o máximo do que sai nos exames no mínimo de páginas, sem fontes. O espaço de cada tema segue o mapa de exames, e as perguntas reais do catálogo dizem o que tem de lá estar. Descobre nos exames quantas folhas são permitidas (ou pergunta o orçamento de páginas), mostra o esboço e **uma amostra renderizada do layout** antes de escrever tudo, chama o `coverage-check` para garantir que os exames antigos se fazem só com a folha, e depois ajusta ao orçamento (apertando a letra, as margens ou o que menos sai, sem nunca cortar o que um tema 🔥 precisa). Guarda só o Word e o PDF, versionados, em `<estudo>/<folha-consulta>-<âmbito>/`.

→ [`SKILL.md`](skills/exam-sheet/SKILL.md)

</details>

<details>
<summary><b><code>coverage-check</code></b> — Verifica se um resumo ou folha chega para os exames</summary>

Responde a "com só este documento, dava para fazer estes exames?". Quem escreveu o documento não consegue avaliá-lo (sabe de onde veio tudo e preenche as falhas de memória), por isso entrega o documento e as perguntas dos exames antigos a subagentes novos, que não viram mais nada, e lhes pede que respondam usando só o documento e digam, pergunta a pergunta, se deu (completa, parcial ou nada) e o que faltou, de forma precisa. Compara com as resoluções oficiais quando existem, junta as falhas por tema, vai buscá-las à `wiki/` e ao `raw/` e acrescenta-as ao documento (de forma compacta e dentro do orçamento, numa folha de consulta), e volta a verificar o que falhou, com agentes novos, até duas rondas. Devolve a cobertura (percentagem das cotações) antes e depois e o que a KB não consegue fechar. Salta-se quando a cadeira não tem exames em `raw/`. É chamada pelo `study-summary` e pelo `exam-sheet`, mas também se usa sozinha ("dá para fazer o exame só com este resumo?").

→ [`SKILL.md`](skills/coverage-check/SKILL.md)

</details>

<details>
<summary><b><code>mock-exam</code></b> — Cria simulados de exame com enunciado e correção separados</summary>

Imita a época escolhida (normal, recurso, especial, modelo) com a mesma duração, consulta, cotações e estilo do professor, a partir do mapa de exames; escolhe os temas pelo peso e pelas tendências e escreve perguntas novas ou variantes de perguntas reais que se respondem só com a matéria da KB — ou, em modo compilação, junta perguntas reais de anos diferentes. Mostra o plano do simulado para aprovação, gera o enunciado (sem pistas) e a correção (resposta-modelo, critérios de cotação, erros que descontam) em Word/PDF numa pasta numerada (`estudo/simulado-<âmbito>-<n>/`), e verifica a correr as respostas de cálculo e código (Python, SWI-Prolog…), marcando o que não pôde verificar.

→ [`SKILL.md`](skills/mock-exam/SKILL.md)

</details>

<details>
<summary><b><code>solve-exam</code></b> — Resolve exames e fichas só com a matéria da cadeira</summary>

Resolve um exame antigo, uma ficha, perguntas do catálogo ou um enunciado colado/fotografado com os métodos, a notação e a linguagem da cadeira, citando a fonte de cada resposta. Para cada pergunta dá a resposta a escrever na prova (do tamanho da cotação e do tempo), o porquê passo a passo e o que vale pontos; segue a resolução oficial quando existe e assinala onde discorda, avisa e pergunta antes de responder ao que está fora da matéria da KB, e verifica a correr cálculos e código. Tem modo só pistas, responde no chat a uma pergunta solta e guarda em Word/PDF versionado (`estudo/resolucao-<enunciado>/`).

→ [`SKILL.md`](skills/solve-exam/SKILL.md)

</details>

<details>
<summary><b><code>correct-attempt</code></b> — Corrige as tuas tentativas e regista os pontos fracos</summary>

Lê a tua resolução (foto, scan, PDF ou texto), confirma contigo a escrita à mão duvidosa antes de corrigir e corrige pergunta a pergunta e critério a critério, com a exigência do professor, contra a melhor referência disponível (soluções do simulado, resolução oficial, `solve-exam` ou uma feita na hora). Classifica cada erro (conceito, cálculo, incompleto, interpretação, notação, por responder), dá uma nota estimada na escala da cadeira e guarda a avaliação (só o `.md`, sem Word/PDF) em `estudo/progresso-<cadeira>/tentativas/`, juntando o ficheiro que enviaste apenas se ainda não estiver no KB. Reconstrói (junto com as sessões do `quiz`) o registo de progresso por tema (🔴/🟡/🟢, tendência, erros recorrentes) e a prioridade de estudo cruzada com o peso nos exames — que o `mock-exam` usa para simulados focados nos pontos fracos e o `study-summary` para mostrar o teu estado em cada tema.

→ [`SKILL.md`](skills/correct-attempt/SKILL.md)

</details>

<details>
<summary><b><code>quiz</code></b> — Tutor no chat que te faz perguntas, focado nos pontos fracos</summary>

Faz perguntas uma a uma no chat — rápidas (definições, escolha múltipla com botões, verdadeiro/falso, contas curtas) ou ao estilo do exame — focadas nos teus pontos fracos (do registo de progresso) ou no que pesa mais nos exames. É socrático: quando erras dá uma pista e deixa-te tentar outra vez antes de explicar, com a fonte; adapta a dificuldade às tuas respostas e volta mais tarde aos temas em que falhaste. Perguntas e respostas vêm da KB e as contas são verificadas antes de perguntar. Guarda cada sessão em `estudo/progresso-<cadeira>/quizzes/` e atualiza o registo — o quiz só decide o estado de um tema enquanto há menos de duas tentativas de exame.

→ [`SKILL.md`](skills/quiz/SKILL.md)

</details>

<details>
<summary><b><code>flashcards</code></b> — Cria flashcards para o Anki</summary>

Gera cartões de um só facto (básicos e cloze) a partir da `wiki/` e da formulação exata do `raw/`, em maior número nos temas que mais saem nos exames e nos teus pontos fracos, cada um com a fonte no verso e etiquetas (cadeira, tema, frequência no exame, `fraco`). Mostra a contagem por tema e uma amostra antes de gerar tudo, guarda a fonte legível em `estudo/flashcards-<âmbito>/` e exporta, com `scripts/anki_export.py`, para o ficheiro de texto do Anki (sem instalar nada) ou para `.apkg` com imagens. Os cartões têm ids estáveis: reimportar uma versão nova atualiza-os no Anki em vez de os duplicar, e os removidos saem com uma etiqueta para os apagares.

→ [`SKILL.md`](skills/flashcards/SKILL.md)

</details>

<details>
<summary><b><code>study-plan</code></b> — Faz o plano de estudo, dia a dia, até aos exames</summary>

Pergunta as datas dos exames, as horas que tens por dia e como estudas (mais leitura ou exercícios, primeiro leitura e depois exercícios, blocos longos ou curtos…), e distribui o tempo por tema em proporção ao peso no exame × fraqueza (do registo de progresso) × tamanho, em fases — matéria, prática e reta final com simulados em condições de exame e correção — com flashcards diários, revisão espaçada e 10–15% de folga. Cada dia tem tarefas concretas com links e a skill a usar (resumo, perguntas do catálogo, quiz, simulado). Mostra o esboço antes de escrever, guarda o plano em markdown com checkboxes (sem Word/PDF) e, no fim, pergunta sempre onde o queres: no teu calendário (conector, p. ex. Google Calendar), num `.ics` ou em lado nenhum — nada é gerado sem um sim. Pode também pôr o plano numa página do Notion (pergunta qual e, se quiseres, guarda-a no `KB_GUIDE.md` para os planos seguintes). Responde a "o que tenho hoje?" e tem um modo de atualizar: dizes o que não fizeste ou o que fizeste a mais e ele reajusta os dias que faltam.

→ [`SKILL.md`](skills/study-plan/SKILL.md)

</details>
