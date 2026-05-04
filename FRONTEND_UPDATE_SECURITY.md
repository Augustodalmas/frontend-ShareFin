# Atualizações de Segurança no Backend — Impacto no Frontend

Este documento descreve mudanças feitas no backend da API ShareFin que **exigem ajustes no frontend**.

---

## 1. POST /api/v1/transactions — Campo `user` removido do body

**O que mudou:** O campo `user` foi removido do body da criação de transação. O backend agora usa sempre o `user_id` do token JWT. Enviar o campo `user` não causa erro, mas é ignorado.

**Ação necessária:** Remover o campo `user` de qualquer chamada de criação de transação.

```diff
// ANTES
{
-  "user": 1,
   "account": 2,
   "category": 3,
   "value": -150.00,
   "name": "Compra no mercado",
   "date_transaction": "2026-05-01"
}

// DEPOIS
{
   "account": 2,
   "category": 3,
   "value": -150.00,
   "name": "Compra no mercado",
   "date_transaction": "2026-05-01"
}
```

---

## 2. Política de senha — Novos requisitos obrigatórios

**O que mudou:** O endpoint `POST /api/v1/usuario` agora exige, além de 8+ caracteres, letras e números:
- Pelo menos uma **letra maiúscula**
- Pelo menos um **caractere especial** (`!@#$%^&*` etc.)

O backend retorna `422` com mensagem específica para cada requisito não atendido.

**Ação necessária:** Atualizar a validação do formulário de cadastro no frontend para refletir os mesmos critérios, mostrando feedback visual ao usuário antes de submeter.

Critérios completos da senha:
- Mínimo 8 caracteres
- Pelo menos uma letra
- Pelo menos um número
- Pelo menos uma letra maiúscula
- Pelo menos um caractere especial (`!@#$%^&*()-_=+[]{}|;':",.<>/?`)

---

## 3. Importação de CSV — Novo formato de resposta em caso de erro

**O que mudou:** O endpoint `POST /api/v1/transactions/import/csv` agora valida cada linha do CSV. Se houver linhas inválidas, retorna `422` com detalhes dos erros **ao invés de importar parcialmente**.

**Resposta de erro (422):**
```json
{
  "erro": "Algumas linhas do CSV são inválidas.",
  "detalhes": [
    { "row": { "account_id": "99", "value": "abc" }, "erro": "O campo value deve ser numérico" },
    { "row": { "account_id": "1" }, "erro": "Campos obrigatórios ausentes: account_id, value, date_transaction" }
  ]
}
```

**Resposta de sucesso (200):**
```json
{
  "count": 10,
  "result": [ ...linhas válidas... ]
}
```

**Ação necessária:**
- Tratar o status `422` na chamada de import e exibir os erros de linha para o usuário.
- Colunas obrigatórias no CSV: `account_id`, `value`, `date_transaction`.
- Coluna opcional: `category_id` (se informada, deve pertencer ao usuário logado).

---

## 4. Compartilhamento de conta — Novo erro 404 para shareCode inválido

**O que mudou:** Os endpoints `POST /api/v1/account` e `PATCH /api/v1/account/:id` com `share: true` agora retornam `404` se o `shareCode` não corresponder a nenhum usuário.

**Resposta de erro (404):**
```json
{ "erro": "Código de compartilhamento inválido." }
```

**Ação necessária:** Tratar o status `404` ao compartilhar conta e exibir mensagem amigável ao usuário (ex: "Código de compartilhamento não encontrado. Verifique e tente novamente.").

---

## 5. GET /api/v1/feedback — Comportamento alterado por perfil

**O que mudou:** O endpoint de listagem de feedbacks agora filtra automaticamente:
- **Usuário comum:** vê apenas seus próprios feedbacks.
- **Admin:** vê todos os feedbacks.

Antes, todos os usuários viam todos os feedbacks do sistema.

**Ação necessária:** Nenhuma mudança de chamada necessária. Verificar se alguma tela exibia feedbacks de outros usuários e ajustar o texto/layout se necessário.

---

## 6. Validações de feedback — Status code corrigido

**O que mudou:** O endpoint `POST /api/v1/feedback` agora retorna `422` (ao invés de `401`) quando `tittle` ou `description` estão ausentes.

**Ação necessária:** Se o frontend trata o status `401` como "não autenticado" e redireciona para login, garantir que o tratamento de erros de validação do feedback verifique `422` separadamente.

---

## 7. Rate limit no CSV import — Limite mais restrito

**O que mudou:** O endpoint de importação de CSV agora tem limite próprio de **10 requisições por hora** (antes usava o limite geral de 150/min).

Se o limite for atingido, o backend retorna `429`:
```json
{ "erro": "Limite de importações CSV excedido. Tente novamente em 1 hora." }
```

**Ação necessária:** Tratar o status `429` no fluxo de import e exibir a mensagem de espera ao usuário.

---

## Resumo das mudanças de contrato

| Endpoint | Mudança | Status anterior | Status novo |
|----------|---------|-----------------|-------------|
| `POST /transactions` | Campo `user` removido do body | — | — |
| `POST /usuario` | Senha exige maiúscula + especial | `422` | `422` (mesma resposta, novo critério) |
| `POST /transactions/import/csv` | Validação linha a linha + retorno estruturado | `200` (sem validação) | `422` se inválido / `200` se ok |
| `POST /account` com `share:true` | 404 se shareCode inválido | `500` (crash) | `404` |
| `PATCH /account/:id` com `share:true` | 404 se shareCode inválido | `500` (crash) | `404` |
| `GET /feedback` | Filtra por usuário logado | retornava tudo | filtra por `user_id` |
| `POST /feedback` | Status de validação corrigido | `401` | `422` |
| `POST /transactions/import/csv` | Rate limit próprio | 150/min | 10/hora |
