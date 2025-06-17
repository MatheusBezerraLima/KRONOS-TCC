const jwt = require('jsonwebtoken');
const StatusCode = require('../../utils/status-code'); 

const verifyRoleUser = async(req, res, next) => {
    const token = req.cookies.authToken;

    if(!token){
        return res.status(StatusCode.UNAUTHORIZED).json({ message: "Acesso negado. Necessário realizar a autenticação "})
    }

    try{
        const user = jwt.verify(token, process.env.SECRET);
        
        if(user.role !== "admin"){
            return res.status(StatusCode.UNAUTHORIZED).json({ message: "Acesso negado. Ambiente Privado!" });
        }

        req.user = user;
        next()
    }catch(err){
        return res.status(StatusCode.FORBIDDEN).json({ message: "Token inválido ou expirado. "});
    }
}