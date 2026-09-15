---
name: high-velocity-git
description: >-
  Ative esta skill para gerenciar commits, branches, mensagens de commit atômicas e revisões de PR.
  Garante histórico de git impecável no padrão Conventional Commits com zero ruído.
---

# High-Velocity Git (Controle de Versão Atômico e Profissional)

Esta skill garante que seu histórico de git seja profissional, auditável e pronto para integração contínua (CI/CD).

## Regras de Execução
1. **Commits Atômicos:**
   - Cada commit deve conter apenas UMA alteração lógica coesa. Não misture refatoração com nova feature ou correção de bug.
2. **Padrão Conventional Commits:**
   - Estrutura: `<tipo>(<escopo opcional>): <descrição curta no imperativo e minúsculo>`
   - Tipos permitidos: `feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `chore:`, `docs:`.
   - Exemplo: `feat(auth): add rate limiting to login endpoint`
3. **Inspeção Pré-Commit Rigorosa:**
   - Antes de commitar, sempre verifique `git status` e `git diff --cached` para garantir que nenhum arquivo temporário, segredo (`.env`) ou arquivo compilado (`dist/`) seja incluído por engano.
4. **Mensagem sem Ruído:**
   - Apenas o comando git pronto e a justificativa resumida em 1 frase. Sem explicações redundantes.
