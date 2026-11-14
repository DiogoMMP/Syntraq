# `dev-tools` — Desenvolvimento

Parte do [Syntraq](../../README.md) — *Power up your agents*. 

Do pedido à entrega: implementar mudanças com um registo escrito, estruturar projetos em Clean Architecture, escrever os testes que importam e documentar o projeto para pessoas (`README.md`) e para agentes (`AGENTS.md`). Funcionam em qualquer stack e nunca fazem commit — isso fica para o [`git-workflow`](../git-workflow/README.md).

## Instalação

```
/plugin marketplace add DiogoMMP/syntraq
/plugin install dev-tools@syntraq
```

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`implement-change`](skills/implement-change/SKILL.md) | Escreve a spec, pergunta se a aceitas e entrega-a a um agente sem contexto que implementa e escreve o `RESULT.md` |
| [`create-readme`](skills/create-readme/SKILL.md) | Escreve ou reescreve o README.md raiz no formato da casa |
| [`create-agents-md`](skills/create-agents-md/SKILL.md) | Escreve ou atualiza o `AGENTS.md` do repositório, em conjunto contigo |
| [`clean-architecture`](skills/clean-architecture/SKILL.md) | Cria (ou reorganiza) um projeto em Clean Architecture |
| [`write-tests`](skills/write-tests/SKILL.md) | Escreve testes unitários e/ou de integração, em qualquer stack |

## Em detalhe

<details>
<summary><b><code>implement-change</code></b> — Implementa uma feature, bugfix ou hotfix ponta a ponta, com registo escrito</summary>

Aceita o pedido em qualquer formato (texto livre, issue, página de wiki, spec, screenshots), determina o tipo de mudança (feature/bugfix/hotfix), investiga o projeto, escreve a spec em `docs/changes/<tipo>/<PREFIXO><NNNN>-<slug>/README.md` antes de tocar em código — separado de `docs/wiki/`/`docs/notes/` para não poluir uma knowledge base que viva no mesmo `docs/` (se o repositório já guarda esses registos noutro sítio, como `docs/features/`, usa esse) — e pergunta-te se aceitas a spec. Só depois de aceite, entrega **apenas a spec** a um agente novo, sem o contexto da conversa, que implementa, corre a verificação própria do projeto e fecha com um `RESULT.md` honesto sobre o que realmente aconteceu, desvios incluídos; no fim, a skill confere o que o agente fez no disco. Não commita nem abre PR — isso fica para `commit-push` e `create-pr`. Créditos: [@michelgomessilva](https://github.com/michelgomessilva).

→ [`SKILL.md`](skills/implement-change/SKILL.md)

</details>

<details>
<summary><b><code>create-readme</code></b> — Escreve ou reescreve o README.md raiz no formato da casa</summary>

Investiga o repositório (stack, arquitetura, módulos, portas, testes, CI) e preenche um template fixo — badges, índice, stack técnica, diagrama de arquitetura, layout anotado, getting started, testes, contribuição — só com factos que consegue provar em ficheiros reais. Pergunta se queres um banner no topo: usa a tua imagem ou, só se pedires, desenha um em SVG (versão clara e escura) e mostra-to antes de o usar. Nunca inventa comandos, versões ou URLs, remove secções sem evidência em vez de as inventar, e nunca escreve nada que pareça um segredo. Mostra o rascunho completo e espera aprovação antes de escrever o ficheiro.

→ [`SKILL.md`](skills/create-readme/SKILL.md)

</details>

<details>
<summary><b><code>create-agents-md</code></b> — Escreve ou atualiza o <code>AGENTS.md</code> do repositório, em conjunto contigo</summary>

Cria o ficheiro de instruções que todos os agentes leem (Claude Code, Codex, Cursor, Copilot…) a partir de um primeiro rascunho do `/init` e do que consegue provar no repositório — scripts, CI (o que corre e o que não corre, branch guards, título de PR, versões automáticas), histórico de branches e commits, padrões do código — e vai perguntando, secção a secção, o que o código não diz: armadilhas, o que nunca fazer, língua e o fluxo git (commits na `main` ou não, `develop`, branches `feature`/`fix`/`hotfix`), com uma recomendação. Só fica o que faria um agente errar se faltasse. Garante que o Claude Code o lê (`@AGENTS.md` num `CLAUDE.md`), não mexe no bloco da knowledge base, mostra o ficheiro completo (ou o diff, ao atualizar) e espera aprovação antes de escrever.

→ [`SKILL.md`](skills/create-agents-md/SKILL.md)

</details>

<details>
<summary><b><code>clean-architecture</code></b> — Cria (ou reorganiza) um projeto em Clean Architecture</summary>

Estrutura um projeto novo em camadas Domain/Application/Infrastructure/Api (+ CrossCutting opcional), ou audita um já existente e propõe um plano de reorganização — adaptando projetos/pastas/ferramentas ao stack real (.NET, Node, Python, Java, Go, ...) em vez de copiar um template. Pergunta primeiro as decisões estruturais (CQRS ou não, um serviço ou vários, base de dados e migrations, Docker, jobs, auth, alcance dos testes) e só cria/move depois de aprovação. Nunca mexe em `docs/` (isso é o `implement-change`/`knowledge-base`) nem commita.

→ [`SKILL.md`](skills/clean-architecture/SKILL.md)

</details>

<details>
<summary><b><code>write-tests</code></b> — Escreve testes unitários e/ou de integração, em qualquer stack</summary>

Pergunta primeiro o alvo (um ficheiro/função/feature à tua escolha, ou uma varredura de cobertura ao projeto) e o nível (unit, integração a nível de serviço/API, ou ambos — sem E2E/browser). Deteta a framework de testes e convenções já usadas (ou pergunta qual montar), resolve como subir dependências reais para testes de integração (Testcontainers, docker-compose existente, host de testes em processo), escreve os menos testes possível que provem o comportamento — em vez de um por cada permutação trivial, já que cada teste é um custo recorrente no CI/CD — corre-os para provar que passam, e sinaliza — sem gerar sozinho — outras lacunas de cobertura que note pelo caminho. Nunca mexe em `docs/` nem commita.

→ [`SKILL.md`](skills/write-tests/SKILL.md)

</details>

## Créditos

- **implement-change** — créditos a [@michelgomessilva](https://github.com/michelgomessilva).
