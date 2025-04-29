
# Guia de Respostas em API Node.js (CRUD, Status Code e Retornos)

## 📌 1. Sobre as respostas para Registro/Login
- Quando o usuário faz o **registro** ou **login**, **não basta apenas enviar o status code**.
- **Sempre envie uma resposta em JSON**, contendo:
  - **Status da operação** (sucesso ou erro).
  - **Mensagem** para o usuário/front entender o que aconteceu.
  - **(No caso do login)**: Um **token** (geralmente JWT) para autenticação futura.

**Exemplo de resposta para sucesso no login:**
```json
{
  "status": "success",
  "message": "Login bem-sucedido",
  "token": "<token_gerado_aqui>"
}
```

**Exemplo de resposta para erro no login:**
```json
{
  "status": "error",
  "message": "Credenciais incorretas"
}
```

---

## 📌 2. Sobre respostas para Listagem de Usuários
- Quando você lista usuários ou qualquer outro recurso, **deve retornar um JSON com os dados**.
- Um padrão bem utilizado é envolver o array de dados em uma estrutura que também informe o status.

**Exemplo de resposta para listagem:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nome": "Usuário A",
      "email": "usuarioa@email.com"
    },
    {
      "id": 2,
      "nome": "Usuário B",
      "email": "usuariob@email.com"
    }
  ]
}
```
- Isso facilita o tratamento da resposta no frontend.

---

## 📌 3. Padrão de Resposta para o CRUD (Recomendado)
| Operação        | Status HTTP | Corpo da Resposta (JSON)                                             |
|-----------------|-------------|----------------------------------------------------------------------|
| Criar (POST)    | 201 Created  | `{ "status": "success", "message": "Usuário criado com sucesso" }`  |
| Listar (GET)    | 200 OK       | `{ "status": "success", "data": [...] }`                             |
| Buscar (GET)    | 200 OK       | `{ "status": "success", "data": {...} }`                             |
| Atualizar (PUT) | 200 OK       | `{ "status": "success", "message": "Usuário atualizado com sucesso" }` |
| Deletar (DELETE)| 200 OK       | `{ "status": "success", "message": "Usuário deletado com sucesso" }` |
