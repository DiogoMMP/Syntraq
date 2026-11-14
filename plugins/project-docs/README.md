# `project-docs` — Documentação técnica

Parte do [Syntraq](../../README.md) — *Power up your agents*.

A documentação técnica de um repositório, escrita a partir do código e mantida verdadeira: gerar a árvore de documentação, atualizar só o que uma alteração tocou e registar as decisões de arquitetura. A regra de ouro: **só entra o que foi medido ou citado de ficheiros reais**. Contagens são contadas, "não existe X" regista a pesquisa que o provou, e o que não se sabe vira `TODO`, nunca uma inferência. Funcionam em qualquer stack, adaptam-se à estrutura de documentação que o projeto já tem e nunca fazem commit — isso fica para o [`git-workflow`](../git-workflow/README.md).

Para o README do projeto e para o `AGENTS.md` há o [`dev-tools`](../dev-tools/README.md); para conhecimento pessoal (notas, wiki, decisões de uma knowledge base) há o [`knowledge-base`](../knowledge-base/README.md).

## Instalação

```
/plugin marketplace add DiogoMMP/syntraq
/plugin install project-docs@syntraq
```

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`docs-tree`](skills/docs-tree/SKILL.md) | Gera a árvore de documentação técnica a partir do código: arquitetura, spec técnica, desenvolvimento, operações |
| [`update-docs`](skills/update-docs/SKILL.md) | Põe a documentação em dia com uma alteração, tocando só nas secções que o diff afeta |
| [`create-adr`](skills/create-adr/SKILL.md) | Regista uma decisão de arquitetura (ADR) na pasta de ADRs do repositório |

## Em detalhe

<details>
<summary><b><code>docs-tree</code></b> — Gera a árvore de documentação técnica a partir do código</summary>

Levanta primeiro um registo de factos verificados (módulos, entry points, entidades contadas, migrations, jobs, dependências externas, testes, pipelines) e só depois escreve — arquitetura (diagramas, ADRs, fluxo de dados), spec técnica (API ou superfície pública, modelo de dados, segurança), desenvolvimento e operações — adaptando a estrutura ao que o projeto realmente tem e respeitando um `docs/` que já exista (nunca lhe substitui o índice). O índice traz a data do snapshot, um mecanismo nunca é documentado como design se o registo de defeitos mostra que era um bug, e uma lacuna vira um `TODO` com quem a pode fechar. Verifica números, caminhos e lint antes de reportar e começa o relatório pelos `TODO`.

→ [`SKILL.md`](skills/docs-tree/SKILL.md)

</details>

<details>
<summary><b><code>update-docs</code></b> — Põe a documentação em dia com uma alteração</summary>

A partir de um módulo que indicas ou do diff da branch contra a base, descobre a estrutura de documentação do projeto, mapeia o que mudou para o que isso invalida (API, modelo de dados, fluxo de dados, segurança, operações, onboarding) e edita só esses parágrafos, linhas ou fragmentos de diagrama — lê antes de editar, nunca regenera um ficheiro inteiro, volta a medir qualquer contagem que toque e verifica se a documentação descrevia um bug como se fosse design. Regista o que mudou no changelog da documentação, quando há um, e se nada precisava de mudar diz isso mesmo.

→ [`SKILL.md`](skills/update-docs/SKILL.md)

</details>

<details>
<summary><b><code>create-adr</code></b> — Regista uma decisão de arquitetura (ADR) no repositório</summary>

Descobre onde o projeto guarda os ADRs (ou propõe `docs/adr/`), numera a partir dos existentes, segue o template do próprio projeto (ou cria um) e acrescenta uma linha ao índice sem mexer nas que já lá estão. Redige a partir da conversa e mostra-te para confirmares, em vez de te interrogar campo a campo; cada afirmação vem de algo que disseste ou de algo verificável no repositório, uma justificação em falta vira `TODO` e as consequências têm de incluir o custo, não só o benefício. Para uma nota de decisão numa knowledge base usa a `adr-new` do plugin `knowledge-base`.

→ [`SKILL.md`](skills/create-adr/SKILL.md)

</details>
