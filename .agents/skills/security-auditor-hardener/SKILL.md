---
name: security-auditor-hardener
description: >-
  Ative esta skill ao criar endpoints de API, fluxos de autenticação/autorização, manipulação de banco de dados
  ou ingestão de dados de usuários para auditar e blindar contra vulnerabilidades (OWASP Top 10).
---

# Security Auditor & Hardener (Segurança Defensiva e Zero-Trust)

Esta skill aplica padrões de segurança defensiva em nível bancário para todas as alterações de código.

## Checklist de Verificação Obrigatória
1. **Injeção de Código e SQL:**
   - Nunca concatene strings em queries ou comandos do sistema operacional (`child_process.exec`, raw SQL queries).
   - Use exclusivamente queries parametrizadas (Prepared Statements) ou ORMs validados.
2. **Autenticação e Autorização (Anti-IDOR):**
   - Nunca confie apenas no ID vindo do cliente (ex: `req.params.id`). Verifique explicitamente se o usuário autenticado na sessão possui permissão de leitura/escrita naquele recurso específico.
3. **Higienização e Validação de Entradas:**
   - Todas as entradas externas (query params, body, headers) devem ser validadas estritamente via esquemas tipados (ex: Zod, Valibot) antes de alcançar as regras de negócio.
4. **Vazamento de Segredos e Dados Sensíveis:**
   - Nunca insira chaves de API, senhas ou tokens no código-fonte. Use variáveis de ambiente (`process.env`).
   - Remova campos sensíveis (hashes de senhas, tokens de reset) das respostas JSON para o frontend.
5. **Proteção de Taxa (Rate Limiting) e CORS:**
   - Garanta que rotas públicas ou sensíveis (login, recuperação de senha, webhooks) possuam proteção contra brute-force e CORS restritivo.
