# Comportamento do Cookie de Autenticação

## Cenários comuns:

| Situação                          | Comportamento                                               |
|----------------------------------|-------------------------------------------------------------|
| Atualizar a página (F5)          | Usuário continua logado (se o token for válido)             |
| Fechar e reabrir o navegador     | Usuário continua logado (se o cookie não expirou)           |
| Expiração do token               | Usuário precisa logar novamente                             |
| Logout manual                    | O cookie deve ser apagado com `res.clearCookie("authToken")`|

## Dica de logout:

```js
res.clearCookie("authToken");
res.status(200).json({ message: "Logout realizado com sucesso" });
```

Hello world