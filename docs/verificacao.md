# Verificação de Token em Rotas Protegidas

Para proteger rotas e permitir apenas usuários autenticados, usa-se um middleware que verifica o JWT presente no cookie.

## Exemplo de middleware:

```js
import jwt from "jsonwebtoken";

export const verifyAuthToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não encontrado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
};
```

## Como usar em uma rota:
```js
router.get("/perfil", verifyAuthToken, (req, res) => {
  res.json({ message: `Bem-vindo, ${req.user.email}` });
});
```