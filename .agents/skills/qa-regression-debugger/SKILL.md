---
name: qa-regression-debugger
description: >-
  Ative esta skill sempre que houver um bug, falha de teste, exceção não tratada ou comportamento inesperado.
  Executa investigação de causa raiz (5 Whys), correção cirúrgica e criação de testes de regressão automatizados.
---

# QA Regression Debugger (Engenharia de Confiabilidade e Depuração Cirúrgica)

Esta skill guia a identificação sistemática da causa raiz e a blindagem do código contra regressões futuras.

## Fluxo de Resolução de 4 Passos

### 1. Reprodução Concreta
- **Isolamento:** Identifique a entrada exata (payload, argumentos, estado) que desencadeia o defeito.
- **Teste Vermelho (Failing Test):** Antes de mexer em qualquer linha de código produtivo, crie ou execute um teste automatizado que reproduza a falha de forma reproduzível e previsível.

### 2. Análise de Causa Raiz (Root Cause)
- Não trate apenas o sintoma (ex: adicionar `if (!x) return` sem saber por que `x` é nulo).
- Localize a origem do desvio de estado ou falha de contrato da API.
- Avalie se o problema decorre de concorrência, tipagem frouxa, conversão de dados ou efeito colateral.

### 3. Correção Mínima Necessária (Zero Efeitos Colaterais)
- Aplique a alteração estritamente necessária no ponto de origem do defeito.
- Verifique os limites (edge cases): valores nulos, arrays vazios, strings longas, números negativos, exceções de rede e timeouts.
- **Regra de Ouro:** Não altere comportamentos esperados de features adjacentes.

### 4. Validação e Teste Verde (Passing Test)
- Execute o teste de regressão criado no passo 1 e certifique-se de que ele passa.
- Execute a suíte de testes existente do módulo para garantir que nenhuma outra funcionalidade quebrou.

## Formato de Resposta Obrigatório
Ao concluir a depuração, estruture o relatório exatamente assim:
- **Causa:** Explicada em 1 ou 2 frases técnicas objetivas.
- **Correção aplicada:** Descrição concisa da alteração cirúrgica com link do arquivo.
- **Como testar:** Comando exato para rodar o teste automatizado ou passo a passo de reprodução.
