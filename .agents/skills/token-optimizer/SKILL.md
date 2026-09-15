---
name: token-optimizer
description: >-
  Ative esta skill quando estiver escrevendo código, lendo arquivos ou respondendo para aplicar
  técnicas avançadas de economia de tokens, modificações cirúrgicas e respostas ultra-densas sem verbosidade.
---

# Token Optimizer (Engenharia de Contexto de Alta Eficiência)

Esta skill estabelece diretrizes rigorosas para reduzir o consumo de tokens em 50% a 70%, mantendo a máxima densidade de informação e precisão técnica.

## 1. Regras de Entrada e Inspeção (Input Frugality)
- **Buscas Estritas:** Nunca leia arquivos inteiros se precisar apenas de uma função ou classe. Use ferramentas de visualização com faixas de linhas (`StartLine`/`EndLine`).
- **Grep com Filtros:** Restrinja buscas de texto com globs de extensões e limites de linhas. Nunca liste diretórios massivos como `node_modules`, `dist`, `.git` ou `vendor`.
- **Logs Resumidos:** Ao executar comandos ou testes, capture e processe apenas a saída relevante (stack traces, erros de compilação ou falhas de asserção), sem despejar logs volumosos no contexto.

## 2. Regras de Edição de Código (Surgical Edits)
- **Diffs Cirúrgicos:** Prefira substituição pontual de trechos específicos (`replace_file_content`) em vez de reescrever arquivos completos.
- **Sem Placeholder Preguiçoso:** Não use `// resto do código continua igual`. Edite apenas o bloco estritamente necessário.
- **Preservação de Integridade:** Mantenha comentários originais e estilo existente, evitando formatações cosméticas não solicitadas que inflam o diff.

## 3. Regras de Saída (Zero-Fluff Communication)
- **Elimine Preâmbulos:** Não use frases como "Com certeza!", "Entendido, vou analisar seu código...", "Espero que isso ajude!".
- **Direto ao Ponto:** Apresente o código, o diff ou o resultado da ação imediatamente.
- **Explicação Pós-Ação Concisa:** Se uma explicação for necessária, use no máximo 2 a 3 tópicos destacando o racional da decisão, sem reexplicar a sintaxe básica da linguagem.
