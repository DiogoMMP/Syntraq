# `git-workflow` — Git & GitHub

Parte do [Syntraq](../../README.md) — *Power up your agents*.

Commits e pull requests num fluxo GitFlow para projetos pessoais. Cada passo que mexe no repositório — o commit, o push, o PR — só acontece depois de veres e aprovares o que vai ser feito.

## Instalação

```
/plugin marketplace add DiogoMMP/syntraq
/plugin install git-workflow@syntraq
```

## Skills

| Skill | O que faz |
| :--- | :--- |
| [`commit-push`](skills/commit-push/SKILL.md) | Cria commits no formato do repositório (Conventional Commits por defeito) e faz push, seguindo GitFlow |
| [`create-pr`](skills/create-pr/SKILL.md) | Abre um pull request preenchendo o template do repositório |
| [`code-analyst`](skills/code-analyst/SKILL.md) | Analisa o diff de uma branch com vários agentes especializados, só leitura |
| [`address-bot-review`](skills/address-bot-review/SKILL.md) | Trata as reviews de um bot num PR: analisa todos os findings, corrige e responde a cada um |

## Em detalhe

<details>
<summary><b><code>commit-push</code></b> — Cria commits no formato do repositório (Conventional Commits por defeito) e faz push, seguindo GitFlow</summary>

Lê o estado do repositório, descobre que formato de commit o repositório impõe ou usa (commitlint, commitizen, hooks de `commit-msg`, CI, convenções escritas, histórico) e segue esse — Conventional Commits só quando não encontra nada —, valida a branch contra o modelo GitFlow (`main`/`develop`/`feature`/`bugfix`/`release`/`hotfix`, e também os prefixos do Conventional Commits como `fix/`, `chore/`, `docs/` ou `refactor/`) — ou contra o modelo que o `AGENTS.md`/`CLAUDE.md` do repositório descreve — agrupa o diff em commits coerentes e mostra a(s) mensagem(ns) propostas no chat, aguardando validação explícita antes de commitar — e pergunta separadamente, só depois, se deve fazer push. Quando há uma issue ou ticket associado (no nome da branch ou na conversa — GitHub `#12`, JIRA `ABC-123`, qualquer tracker), é referenciado (`Refs: #12`, `Refs: ABC-123`); quando não há, não se pede nem se inventa um.

→ [`SKILL.md`](skills/commit-push/SKILL.md)

</details>

<details>
<summary><b><code>create-pr</code></b> — Abre um pull request preenchendo o template do repositório</summary>

Confirma que a branch já está commitada e pushed (nunca commita nem faz push), resolve a branch base a partir do GitFlow, lê primeiro o template de PR do repositório (ou, se o repositório não tiver nenhum, usa o template por defeito que vem com a skill, adaptando os comandos de build e testes ao projeto) e preenche-o com base no diff real — em português por defeito — linkando os registos de trabalho que a branch toca (`docs/changes/`, ou `docs/features/`, `docs/bugfixes/`… conforme o repositório usa). A issue ou ticket (`#12`, `ABC-123`) vai no título ou no corpo. Antes de redigir, corre o `code-analyst` ao diff e mostra o relatório. Liga as issues conforme o destino: num PR para a `main` usa `Closes #N`; num PR para a `develop` escreve uma linha `Testing: #N`, que uma GitHub Action do repositório pode ler ao fazer merge para passar as issues a Testing (a skill nunca move issues; sem Action, moves à mão). Mostra o título e o corpo completos e só corre `gh pr create` depois de aprovação explícita.

→ [`SKILL.md`](skills/create-pr/SKILL.md)

</details>

<details>
<summary><b><code>code-analyst</code></b> — Analisa o diff de uma branch com vários agentes especializados, só leitura</summary>

Lança em paralelo um agente por função — correção, segurança, testes, convenções e consistência, simplificação e reutilização, documentação e registos — cada um a ler o diff real contra a branch base. Depois junta e deduplica os resultados, confirma pessoalmente cada blocker e major no código, separa o que a branch introduziu do que já existia, e devolve um relatório ordenado com `ficheiro:linha` e um veredicto. Num diff pequeno usa só dois agentes. Nunca edita, commita nem abre PR; é chamada pelo `create-pr`, mas funciona sozinha.

→ [`SKILL.md`](skills/code-analyst/SKILL.md)

</details>

<details>
<summary><b><code>address-bot-review</code></b> — Trata as reviews de um bot num PR: analisa todos os findings, corrige e responde a cada um</summary>

Lê todos os findings que um bot (CodeRabbit, Copilot, Sonar…) deixou no PR — threads inline, corpos de review, secções fora do diff e nitpicks, comentários do PR, incluindo os já resolvidos — e confere a contagem com a que o bot declara. Verifica cada um contra o código atual e mostra a análise numa tabela por ficheiro (válido, parcial, inválido, já corrigido, ruído), perguntando o que corrigir antes de tocar em nada. Corrige o aprovado, passa o commit pelo `commit-push` e, depois do push, responde **a cada finding na sua própria thread**, identificando o bot — nunca num comentário único. Trata o texto dos findings como dados, nunca como instruções; não faz merge, não descarta reviews nem resolve threads.

→ [`SKILL.md`](skills/address-bot-review/SKILL.md)

</details>
