# 📦 Pull Request

> Por favor preencher os campos abaixo antes de efetuar merge.

---

## 🔍 Tipo de alteração

- [ ] Feature 🚀
- [ ] Bugfix 🐞
- [ ] Hotfix 🔥
- [ ] Refactor ♻️
- [ ] Documentação 📝
- [ ] Chore / manutenção 🔧
- [ ] BREAKING CHANGE 💥
- [ ] Outro: _______________________

---

## 📋 Descrição

<!-- Explica o que foi feito neste PR e porquê -->

---

## 🧪 Como testar

<!-- Passos para o revisor validar as alterações -->

1.
2.

---

## ✅ Checklist de revisão

- [ ] O código compila (`npm run build`, backend e/ou frontend)
- [ ] Os testes locais passam (`npm test`)
- [ ] O PR está atualizado com a branch base
- [ ] Foram efetuadas validações/testes manuais (se aplicável)
- [ ] O nome da branch segue o padrão `<tipo>/<descrição>` (`feature/`, `fix/`, `docs/`, ...)
- [ ] Sem `console.log` / código de debug esquecido
- [ ] Documentação atualizada, se aplicável (`README`, `CLAUDE.md`, comentários)

---

## 🔁 Checklist de sincronização (⚠️ obrigatório para hotfixes)

> Aplica-se **quando o PR é um 'hotfix' ou afeta diretamente a branch 'main'**

- [ ] Os commits relevantes foram **sincronizados com 'develop'** (merge ou cherry-pick)
- [ ] Confirmação de que a versão foi incrementada, se necessário

---

## 🔗 Issues relacionadas

<!-- PR para a main: "Closes #123" fecha a issue ao fazer merge. PR para a develop: uma linha "Testing: #123" (só move a issue para Testing ao fazer merge se o repositório tiver automação que leia essa linha; caso contrário, move-se à mão; a issue só fecha quando chegar à main). Links para tarefas (Jira, Trello), etc. -->

---

## 🖼️ Screenshots

<!-- Se houver mudanças visuais (frontend), adicionar antes/depois -->

---

> ⚠️ Se o PR introduz um 'hotfix', a sincronização com 'develop' é **obrigatória antes do merge final**.
