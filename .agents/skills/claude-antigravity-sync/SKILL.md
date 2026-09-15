---
name: claude-antigravity-sync
description: >-
  Ative esta skill quando estiver alternando o desenvolvimento entre o Antigravity e a extensão do Claude Code.
  Gera resumos de handoff ultracompactos, registra decisões técnicas e sincroniza o estado do projeto para colaboração perfeita sem perda de contexto.
---

# Claude & Antigravity Dual-Agent Sync (Colaboração em Dupla de IA)

Esta skill permite que o **Antigravity** e o **Claude Code** trabalhem como dois engenheiros parceiros no mesmo repositório, sem conflitos de arquivo e sem perda de contexto.

## Como Funciona a Colaboração

Como os dois agentes compartilham o mesmo sistema de arquivos local, mas não compartilham o histórico de chat um do outro, a ponte entre eles é o arquivo **`.agent-handoff.md`** na raiz do projeto.

---

## 1. Ao Concluir um Trabalho no Antigravity (Gerando o Handoff)
Sempre que você criar uma funcionalidade, landing page ou refatoração e o usuário quiser continuar ou fazer ajustes no Claude:

1. **Atualize o arquivo `.agent-handoff.md`** na raiz do projeto com o seguinte formato de alta densidade (máximo 25 linhas):
   ```markdown
   # Agent Handoff Checkpoint
   - **Autor:** Antigravity
   - **Data/Hora:** [Data atual]
   - **Resumo do que foi feito:** [1-2 frases]
   - **Arquivos modificados/criados:**
     - `src/components/...` (Descrição curta)
   - **Decisões Técnicas & Padrões:** [Ex: Tailwind 3.4, Dark mode, Framer motion]
   - **Próximas ações pendentes para o Claude:** [O que o usuário deseja que o Claude altere]
   ```
2. **Forneça o Prompt de Transição:**  
   Gere uma mensagem de apenas 1 linha pronta para o usuário colar no Claude:  
   `"Claude, leia o arquivo .agent-handoff.md e realize a alteração solicitada."`

---

## 2. Ao Receber um Projeto Alterado pelo Claude (Lendo o Retorno)
Se o Claude tiver feito alterações no código:
1. Verifique o `git status` e `git diff` para entender exatamente quais linhas o Claude modificou.
2. Inspecione o `.agent-handoff.md` caso o Claude tenha deixado anotações de retorno.
3. Valide a integridade do código sem desfazer as melhorias feitas pelo Claude.
