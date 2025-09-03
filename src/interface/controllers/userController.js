const {serviceInsertUser, serviceAuthenticateUser, serviceListAllUsers, serviceFindById, serviceChangePasswordUser, serviceFindByEmail} = require("../../application/services/userServices.js"); 
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken");
const DatabaseErrors = require("../../utils/databaseErrors.js");
const StatusCode = require("../../utils/status-code.js");


const getRegisterUser = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  try{
    const newUser = await serviceInsertUser({ nome, email, senha, telefone});

    if(!newUser || newUser == null){
      console.log("Error ao registrar usuario");
    }

    getAuthenticateUser(req, res);
    
  }catch(err){

    if (err.code === DatabaseErrors.DUPLICATE_ENTRY) {
      return res.status(StatusCode.CONFLICT).json({ erro: 'Este email já está cadastrado' });
    }
    
    if (err.code === DatabaseErrors.BAD_NULL_ERROR) {
      return res.status(StatusCode.BAD_REQUEST).json({ erro: 'Preencha todos os campos obrigatórios' });
    }
    
    if (err.code === DatabaseErrors.CONNECTION_LOST) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ erro: 'Erro de conexão com o banco de dados' });
    }
    
    console.error(err)
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ erro: 'Erro inesperado no servidor' });    

  }
};

const getAuthenticateUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { user, token } = await serviceAuthenticateUser({ email, senha });
    
    res.cookie("authToken", token, {
        httpOnly: true,                                   // Bloqueia o acesso por meio do JS pelo lado do usuário
        secure: process.env.NODE_ENV === "production",    // Só permite acesso em ambiente de produção
        sameSite: "Strict",                               // Restringe para que apenas o próprio site tenha acesso
        maxAge:  30 * 60 * 1000                           // Tempo de duração em milisegundos 
    });    

    res.status(StatusCode.OK).redirect('/');
    
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(StatusCode.NOT_FOUND).json({ message: "Usuário não existe" });
    }
    if (err.message === "INVALID_PASSWORD") {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: "Credenciais incorretas. Verifique os dados." });
    }
    console.error(err);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Erro no Servidor" });
  }
};

const getListAllUsers = async (req, res) => {

  try{
    const listUsers = await serviceListAllUsers();

    if(!listUsers){
      res.status(StatusCode.OK).json({ message: "Nenhum usuário encontrado" });
    }

    res.redirect('');

  }catch(err){

    if(err.code === DatabaseErrors.NO_SUCH_TABLE){
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ erro: "A tabela especificada não existe" });
    }
    if(err.code === DatabaseErrors.CONNECTION_LOST){
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ erro: "A conexão com o banco foi perdida" });
    }
    console.error('Erro inesperado ao listar usuários:', err);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ erro: "Erro interno ao buscar usuário" });
  }

};

const getFindById = async (req, res) => {
  const id = req.params.id;

  try{
    const user = await serviceFindById(id)
    
    res.status(StatusCode.OK).json({ user : user })
  }catch(err){
    console.error("Erro ao Buscar por ID:", err)
  }
}

const getFindByEmail = async(req, res) => {
  const { email } = req.body;  

  try{
    const user = await serviceFindByEmail(email);
    res.status(StatusCode.OK).json({ response: user });
  }catch(err){
    console.error("Erro ao Buscar por Email:", err);
  }
}

  const getChangePasswordUser = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    try{
      const response = await serviceChangePasswordUser({userId, currentPassword, newPassword, confirmNewPassword});

      res.status(StatusCode.OK).json({ response: response });
  }catch(err){
    console.error(err);
  }
}

module.exports = {
  getAuthenticateUser,
  getListAllUsers,
  getRegisterUser,
  getFindById,
  getFindByEmail,
  getChangePasswordUser
}