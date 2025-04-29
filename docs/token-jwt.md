# Guia de Uso de Token JWT em API Node.js

## 📌 1. O que é um Token?
- **Token** é uma chave digital, geralmente gerada no login, que comprova que o usuário foi autenticado.
- O tipo mais usado é o **JWT (JSON Web Token)**.
- Ele carrega informações sobre o usuário e tem um prazo de validade.

---

## 📌 2. Como gerar o Token no Login

**Instalações necessárias:**
```bash
npm install express jsonwebtoken dotenv
```

**Exemplo básico:**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { email: email, role: 'user' },   // Dados que você quer guardar
  process.env.JWT_SECRET,           // Chave secreta do .env
  { expiresIn: '1h' }               // Tempo de validade
);
```

Depois envie o token no JSON de resposta.

---

## 📌 3. Como armazenar o Token no Frontend
- **localStorage** (menos seguro para aplicações grandes).
- **Cookies com httpOnly e Secure** (mais seguro para aplicações sensíveis).

**Exemplo frontend com localStorage:**
```javascript
localStorage.setItem('token', tokenRecebido);
```

---

## 📌 4. Como proteger rotas usando o Token

**Middleware de verificação:**
```javascript
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ status: 'error', message: 'Token não fornecido' });
  }

  const tokenSemBearer = token.split(' ')[1];

  jwt.verify(tokenSemBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Token inválido' });
    }

    req.user = decoded;
    next();
  });
};
```

**Uso nas rotas:**
```javascript
app.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});
```

---

## 📌 5. Boas práticas para segurança do Token
- Use uma **chave secreta forte** no `.env`.
- Configure tempo de expiração do token (`expiresIn`).
- Utilize **cookies httpOnly** para máxima segurança se possível.
- Considere implementar **Refresh Token** para renovar tokens automaticamente.

---

# 📄 Exemplo Completo de Estrutura Básica

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ status: 'error', message: 'Token não fornecido' });

  const tokenSemBearer = token.split(' ')[1];

  jwt.verify(tokenSemBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ status: 'error', message: 'Token inválido' });

    req.user = decoded;
    next();
  });
};

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (email === 'usuario@exemplo.com' && senha === 'minhasenha') {
    const token = jwt.sign({ email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ status: 'success', message: 'Login bem-sucedido', token });
  }
  return res.status(401).json({ status: 'error', message: 'Credenciais incorretas' });
});

app.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

# ✅ Resumo Rápido
- Envie sempre **status code + JSON**.
- Para **login**, envie também o **token**.
- Para **listar**, envie os dados em JSON, com chave `data`.
- Proteja rotas com um **middleware** que lê e verifica o **token**.
- Configure tudo via **.env** para segurança.
