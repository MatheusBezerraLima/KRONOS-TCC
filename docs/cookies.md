# Uso de Cookies em Autenticação

Cookies são pequenos arquivos armazenados no navegador do cliente. No contexto de autenticação, eles são usados para armazenar tokens (como JWT) que identificam o usuário.

## Exemplo de uso no Express:

```js
res.cookie("authToken", token, {
  httpOnly: true, // Protege contra acesso via JavaScript (evita XSS)
  secure: process.env.NODE_ENV === "production", // Envia só por HTTPS em produção
  sameSite: "Strict", // Protege contra CSRF (envia apenas no mesmo domínio)
  maxAge: 30 * 60 * 1000, // Expira em 30 minutos
});
```

## Quando usar Cookies:
- Para manter o usuário logado entre requisições
- Para evitar ataques XSS e CSRF, com `httpOnly` e `sameSite`
- Em autenticação baseada em sessões com tokens