# 🛡️ **Padrões de Validação de Senha**

Este arquivo contém o padrão de validação de senha para o projeto. A validação deve ocorrer **no front-end (HTML + JavaScript)** e **no back-end (Node.js)** para garantir que a senha do usuário atenda aos requisitos de segurança.

## 🚀 **Requisitos de Segurança da Senha**

A senha do usuário deve atender aos seguintes requisitos de segurança:

1. **Pelo menos 1 letra maiúscula**.
2. **Pelo menos 1 número**.
3. **Pelo menos 1 caractere especial** (ex.: `@`, `#`, `!`, etc.).
4. **Comprimento mínimo de 8 caracteres**.

### Expressão Regular (Regex) para Validação

```regex
^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$
```

### Explicação da Regex:
- `(?=.*[A-Z])`: Garante pelo menos uma letra maiúscula.
- `(?=.*\d)`: Garante pelo menos um número.
- `(?=.*[!@#$%^&*(),.?":{}|<>])`: Garante pelo menos um caractere especial.
- `.{8,}`: Garante que a senha tenha pelo menos 8 caracteres de comprimento.

---

## 🖥️ **Validação no Front-End**

### HTML + JavaScript

No **front-end**, a validação deve ser feita no momento em que o usuário digitar a senha, com uma mensagem de erro visível caso a senha não atenda aos requisitos.

#### Exemplo de Formulário HTML:

```html
<form id="formCadastro" method="POST">
  <label for="senha">Senha:</label>
  <input type="password" id="senha" name="senha" required>
  <span id="erro-senha" style="color: red; display: none;">
    A senha deve ter pelo menos uma letra maiúscula, um número e um caractere especial.
  </span>
  <button type="submit">Cadastrar</button>
</form>
```

#### Exemplo de Validação com JavaScript:

```javascript
const senhaInput = document.getElementById('senha');
const erroSenha = document.getElementById('erro-senha');

senhaInput.addEventListener('input', function () {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!regex.test(senhaInput.value)) {
    erroSenha.style.display = 'block';
  } else {
    erroSenha.style.display = 'none';
  }
});
```

- **Validação em tempo real**: A validação é feita assim que o usuário digita a senha.
- **Mensagem de erro**: Uma mensagem de erro será exibida caso a senha não atenda aos requisitos.

---

## 💻 **Validação no Back-End (Node.js)**

No **back-end**, a senha também deve ser validada antes de ser armazenada no banco de dados, garantindo que a regra de segurança seja aplicada independentemente do que o front-end passou.

#### Exemplo de Validação no Back-End com Express:

```javascript
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/cadastro', (req, res) => {
  const { senha } = req.body;

  // Regex para validar a senha
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!regex.test(senha)) {
    return res.status(400).json({
      erro: 'A senha deve ter pelo menos uma letra maiúscula, um número e um caractere especial.',
    });
  }

  // Aqui você pode seguir com o processo de inserção do usuário
  res.status(201).json({ sucesso: 'Usuário cadastrado com sucesso!' });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

- **Validação no back-end**: A senha é validada novamente no back-end para garantir que a senha enviada pelo front-end esteja correta.
- **Erro de resposta**: Se a senha não passar na validação, o servidor responde com um erro (status `400`).

---

## 🔐 **Armazenamento Seguro de Senha**

**Nunca armazene senhas em texto puro!** É fundamental **criptografar a senha** antes de armazená-la no banco de dados. Use algoritmos de **hashing** como o `bcrypt` para garantir a segurança.

### Exemplo de Criptografia de Senha com `bcrypt`:

```javascript
const bcrypt = require('bcrypt');
const senha = 'MinhaSenha123!';

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) throw err;
  console.log('Senha criptografada:', hash);
});
```

- **Criptografia**: O `bcrypt` gera um hash da senha, que pode ser armazenado no banco de dados.
- **Comparação de Senha**: Quando o usuário tenta fazer login, o hash da senha inserida é comparado com o hash armazenado no banco.

---

## 📌 **Outras Boas Práticas de Segurança**

- **Política de Expiração de Senha**: As senhas devem ser alteradas periodicamente, por exemplo, a cada 6 meses.
- **Autenticação Multifatorial (MFA)**: Sempre que possível, utilize MFA para aumentar a segurança.
- **Proteção contra Força Bruta**: Implemente medidas para proteger contra ataques de força bruta, como limitação de tentativas de login.
- **Logs de segurança**: Armazene logs de tentativas de login falhadas para monitoramento de atividades suspeitas.

---

### 🔄 **Expansões Futuros**

Este documento pode ser expandido com os seguintes tópicos, conforme o projeto evolui:

- **Proteção contra SQL Injection**
- **Proteção contra XSS (Cross-Site Scripting)**
- **Políticas de CORS (Cross-Origin Resource Sharing)**
- **Requisitos de Senha Adicionais (ex.: 16 caracteres, caracteres únicos)**
- **Testes de Segurança**: Como realizar testes de penetração (pen-test) para validar a segurança do sistema.

