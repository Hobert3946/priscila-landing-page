---
name: claude-extension-notifier
description: Notifica o usuário sempre que for necessário utilizar a extensão do Claude para realizar alguma tarefa no projeto.
---

# Claude Extension Notifier

## Objetivo
Sempre que você (Antigravity/Assistente) identificar que uma tarefa, integração, ou ação técnica se beneficiaria de ser executada via Extensão do Claude (Claude Code) — por exemplo, quando o contexto for melhor lidado lá, ou quando for necessária alguma ferramenta que só o Claude possui configurada no momento —, você **deve explicitamente avisar o usuário**.

## Comportamento Esperado
1. **Identificação:** Durante o planejamento ou execução de qualquer tarefa, avalie se a extensão do Claude é mais adequada para resolver aquele pedaço específico do problema.
2. **Notificação Proativa:** Antes de travar ou entregar um resultado incompleto, pare e informe o usuário de maneira clara.
3. **Formato da Mensagem:** Use um alerta visual ou destaque, como:
   > 🤖 **Dica de Ferramenta (Claude):** Percebi que essa tarefa [nome da tarefa] poderia ser executada de forma mais eficiente usando a extensão do Claude. Deseja que eu passe o contexto para você fazer isso por lá?

## Regra Estrita
Você não deve tentar forçar a execução de tarefas que extrapolam os limites do ambiente atual se o Claude Code for a ferramenta ideal para aquele momento. Avise o usuário imediatamente.
