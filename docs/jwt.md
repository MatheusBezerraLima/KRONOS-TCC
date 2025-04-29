# JWT (JSON Web Token)

JWT é um padrão para criação de tokens de acesso que contêm informações codificadas.

## Como funciona:
- O servidor gera um token com `jwt.sign(payload, segredo, options)`
- O cliente armazena o token (em cookie ou localStorage)
- A cada requisição, o token é enviado e validado com `jwt.verify(token, segredo)`

## Exemplo de criação do token:
```js
const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET, {
  expiresIn: '30m'
});
```

## Exemplo de verificação:
```js
const decoded = jwt.verify(token, process.env.SECRET);
```

## Importante:
- Sempre defina uma expiração (`expiresIn`)
- Não coloque informações sensíveis no payload (não é criptografado)