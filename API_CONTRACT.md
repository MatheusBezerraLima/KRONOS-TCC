# Contrato da API Kronos

**URL Base:** `https://api.kronosapp.com.br/v1`

---

## ➡️ Tarefas (Tasks)

### Criar uma Tarefa de Projeto

* **Endpoint:** `POST /tasks`
* **Descrição:** Cria uma nova tarefa associada a um projeto. Requer autenticação.

* **Corpo da Requisição (Payload):**
    ```json
    {
      "criador_id": 1,
      "projeto_id": 12,
      "titulo": "Refatorar a autenticação com JWT",
      "descricao": "Atualizar a biblioteca e implementar refresh tokens.",
      "coluna_id": 2,
      "categoria_id": 5,
      "prioridade": "Alta",
      "assignedMemberIds": [2, 5],
      "subTasksNames": ["Fazer Logo", "Comer"],
      "data_termino": "2025-11-15T23:59:59.000Z"
    }
    ```
* **Resposta de Sucesso (201 Created):**
    ```json
    {
      "id": 50,
      "titulo": "Refatorar a autenticação com JWT",
      "status_id": 1,
      "coluna_id": 2,
      "assignedMembers": [
          { "id": 2, "nome": "Ana" },
          { "id": 5, "nome": "Carlos" }
      ]
    }
    ```
* **Respostas de Erro:**
    * `400 Bad Request`: Faltam campos obrigatórios.
    * `403 Forbidden`: O utilizador não é membro do projeto.
    * `404 Not Found`: O projeto_id ou coluna_id não existem.

----------------------------------------

### Criar uma Tarefa Pessoal

* **Endpoint:** `POST /tasks`
* **Descrição:**  Cria uma nova tarefa pessoal, não associada a nenhum projeto. A ausência do campo projeto_id no corpo da requisição indica que a tarefa é pessoal. Requer autenticação.

* **Corpo da Requisição (Payload):**
    ```json
    {
        "criador_id": 1,
        "titulo": "Comprar pão e leite depois do trabalho",
        "descricao": "Não esquecer de passar no supermercado.",
        "status_id": 1,
        "categoria_id": 8,
        "prioridade": "Baixa"
    }
    ```    
    - `criador_id (Obrigatório)`: ID do utilizador autenticado.

    - `titulo (Obrigatório)`: O nome da tarefa.

    - `status_id (Obrigatório)`: O ID do status inicial da tarefa (ex: 1 para "A Fazer").

    - `descricao, categoria_id, prioridade (Opcionais)`: Detalhes adicionais da tarefa.

* **Resposta de Sucesso (201 Created):**
    ```json
    {
        "id": 51,
        "projeto_id": null,
        "titulo": "Comprar pão e leite depois do trabalho",
        "descricao": "Não esquecer de passar no supermercado.",
        "status_id": 1,
        "coluna_id": null,
        "categoria_id": 8,
        "prioridade": "Baixa",
        "criador_id": 1,
        "criado_em": "2025-10-18T15:30:00.000Z"
    }
    ```



* **Respostas de Erro:**
    * `400 Bad Request`: Faltam campos obrigatórios como titulo ou status_id.
    * `401 Unauthorized`: O criador_id não foi fornecido ou o token de autenticação é inválido.

---

## ➡️ Membros do Projeto (Project Members)

### Adicionar Membro a um Projeto

* **Endpoint:** `POST /projects/{projectId}/members`
* **Descrição:** Adiciona um usuário existente como membro de um projeto específico. Requer autenticação e que o usuário autenticado tenha a função de "Criador" ou "Administrador" no projeto.
* **Parâmetros de URL:**
    * `{projectId}` (Obrigatório): O ID do projeto onde o novo membro será adicionado.
* **Corpo da Requisição (Payload):**
    ```json
    {
      "userIdToAdd": 25,
      "role": "Membro"
    }
    ```
    * **`userIdToAdd` (Obrigatório):** O ID do usuário que será adicionado ao projeto.
    * **`role` (Opcional):** A função a ser atribuída ao novo membro. Se omitido, o padrão será "Membro".

* **Resposta de Sucesso (201 Created):**
    A API retorna o objeto da nova associação criada, confirmando que o usuário foi adicionado com sucesso.
    ```json
    {
      "id": 150,
      "usuario_id": 25,
      "project_id": 123,
      "role": "Membro",
      "createdAt": "2025-10-18T15:45:00.000Z"
    }
    ```

* **Respostas de Erro:**
    * `401 Unauthorized`: O usuário que está a fazer o pedido não está autenticado.
    * `403 Forbidden`: O usuário autenticado não tem permissão (não é "Criador" nem "Administrador") para adicionar membros a este projeto.
    * `404 Not Found`: O `projectId` ou o `userIdToAdd` não foram encontrados na base de dados.
    * `409 Conflict`: O `userIdToAdd` já é um membro deste projeto.
    * `500 Internal Server Error`: Ocorreu uma falha inesperada no servidor ao tentar adicionar o membro.

---

### Convidar Novos Membros por E-mail

* **Endpoint:** `POST /projetos/{projectId}/convites`
* **Descrição:** Envia convites por e-mail para um ou mais utilizadores se juntarem a um projeto. Ideal para convidar pessoas que ainda não têm uma conta na plataforma. Requer autenticação e que o utilizador autenticado tenha a função de "Criador" ou "Administrador" no projeto.

* **Parâmetros de URL:**
    * `{projectId}` (Obrigatório): O ID do projeto para o qual os convites serão enviados.
* **Corpo da Requisição (Payload):**
    ```json
    {
      "emails": [
        "novo.colega@empresa.com",
        "parceiro.externo@outrodominio.com"
      ],
      "role": "Membro"
    }
    ```
    * **`emails` (Obrigatório):** Um array de strings contendo os endereços de e-mail a serem convidados.
    * **`role` (Opcional):** A função a ser atribuída aos utilizadores quando aceitarem o convite. Se omitido, o padrão será "Membro".

* **Resposta de Sucesso (200 OK):**
    A API retorna um objeto confirmando o processamento e um relatório (`results`) que categoriza o que aconteceu com cada e-mail enviado. Isto permite que o frontend dê um feedback detalhado ao utilizador.
    ```json
    {
      "message": "Convites processados com sucesso.",
      "results": {
        "invitationsSent": [
          "novo.colega@empresa.com"
        ],
        "alreadyMembers": [],
        "alreadyInvited": [
          "parceiro.externo@outrodominio.com"
        ]
      }
    }
    ```

* **Respostas de Erro:**
    * `400 Bad Request`: O campo `emails` não foi fornecido, não é um array ou está vazio.
    * `401 Unauthorized`: O utilizador que está a fazer o pedido não está autenticado.
    * `403 Forbidden`: O utilizador autenticado não tem permissão (não é "Criador" nem "Administrador") para enviar convites para este projeto.
    * `404 Not Found`: O `projectId` fornecido na URL não corresponde a um projeto existente.
    * `500 Internal Server Error`: Ocorreu uma falha inesperada no servidor durante o processamento dos convites.

---