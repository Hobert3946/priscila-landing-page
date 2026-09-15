---
name: spec-driven-architect
description: >-
  Ative esta skill quando for planejar uma nova funcionalidade, refatoração estrutural, modelagem de banco de dados
  ou integração de API complexa. Garante desenho técnico robusto antes de qualquer linha de código.
---

# Spec-Driven Architect (Engenharia de Arquitetura Principal)

Esta skill impede o ciclo vicioso de "tentativa e erro" de código. Antes de implementar funcionalidades complexas, estruture o desenho técnico seguindo padrões de engenharia de nível Staff/Principal.

## Princípios Arquiteturais
1. **Contrato Primeiro (Contract-First):** Defina interfaces TypeScript, esquemas Zod/JSON Schema ou assinaturas de endpoints antes de implementar a lógica interna.
2. **Idempotência e Tolerância a Falhas:** Preveja cenários de rede instável, retentativas seguras e transações com rollback.
3. **Complexidade Algorítmica e Banco de Dados:** Analise impacto de consultas N+1, índices necessários em chaves estrangeiras e paginação por cursor em vez de offset para coleções volumosas.

## Formato da Especificação Rápida (Mini-RFC)
Antes de codificar, produza uma especificação com no máximo 30 a 50 linhas:

```markdown
### 1. Objetivo & Invariantes
- O que a feature faz e quais regras de negócio NUNCA podem ser violadas.

### 2. Contratos de Dados & Interfaces
- Tipos TypeScript / DTOs / Esquema de tabelas ou entidades.

### 3. Casos de Borda Críticos
- Cenários com dados nulos, concorrência, limites de taxa ou falhas de provedores terceiros.

### 4. Plano de Execução em Fases
- [Passo 1] Modelagem / Contrato
- [Passo 2] Lógica de negócio e validações
- [Passo 3] Testes unitários e de integração
```
