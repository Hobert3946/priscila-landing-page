---
name: simplicity-first-refactor
description: >-
  Ative esta skill quando for revisar código, refatorar módulos complexos ou limpar dívida técnica.
  Foca no princípio KISS (Keep It Simple, Stupid), redução de dependências desnecessárias e eliminação de over-engineering.
---

# Simplicity-First Refactor (Engenharia Anti-Complexidade & KISS)

O melhor código é aquele que não precisa ser escrito. Cada linha adicionada é uma dívida de manutenção e um potencial vetor de falha.

## Diretrizes de Simplicidade
1. **Regra dos 30/250:**
   - Funções devem idealmente ter menos de 30 linhas e realizar apenas uma responsabilidade clara.
   - Arquivos não devem ultrapassar 250 linhas; caso contrário, divida em submódulos coesos.
2. **Eliminação de Abstrações Prematuras:**
   - Não crie classes genéricas, fábricas ou padrões de design complexos antes de ter pelo menos 3 casos reais e comprovados de duplicidade (Regra dos Três).
   - Prefira composição de funções puras a hierarquias de herança profundas.
3. **Zero Dependências Desnecessárias:**
   - Evite adicionar pacotes npm para operações simples que a biblioteca padrão da linguagem ou APIs nativas do runtime resolvem com poucas linhas.
4. **Eliminação Ativa de Dead Code:**
   - Remova importações não utilizadas, variáveis mortas e código comentado. Use o git para histórico, não o arquivo-fonte.
