const jwt = require("jsonwebtoken");

const verifyAuthToken = async(req, res, next) => {
  // capturando o token do cookie
    const token = req.cookies.authToken;    

    if(!token){
        return res.status(StatusCode.UNAUTHORIZED).json({ message: "Acesso negado. Necessário realizar a autenticação "})
    }

    try{
      // verificando se o token do cookie é valido. 
        const decoded = jwt.verify(token, process.env.SECRET);  
        req.user = decoded
        next();
    }catch(err){
        return res.status(StatusCode.FORBIDDEN).json({ message: "Token inválido ou expirado. "});
    }
};

module.exports = verifyAuthToken;
