const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const UserDAO = require('../../infra/database/repositories/userRepository');

const serviceInsertUser = async (data) => {
  try {
   // Aplicar regras de negócio aqui...
    // await validateRequiredFields(data)

    const resultInsert = await UserDAO.create(data) 

    return resultInsert.id;

  } catch (err) {
    throw new Error(err);
  }
};

const serviceAuthenticateUser = async (data) => {
  // busca o usuario no banco
    const user = await UserDAO.findByEmail(data.email)

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // verificando compatibilidade da senha
    const passwordIsMatch = await bcrypt.compare(data.senha, user.senha);

    if(!passwordIsMatch){
      throw new Error("INVALID_PASSWORD");
    }
    
    // Criando um "corpo" para o token de autenticação
    const payload = {
      id: user.id,
      email: user.email
    }

    // Criando o token utilizando o  payload e a chave secreta 
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '30m'
    })
      
    return {user, token};
};

const serviceChangePasswordUser = async(data) => {
  // Verificar qual usuário solicitou a alteração 
  const user = await UserDAO.findById(data.userId);

  if(!user){
    throw new Error("O que vc faz aqui? Token expirado? Segurança fraca?");
  }
  
  const passwordIsMatch = await bcrypt.compare(data.currentPassword, user.senha);

  if(!passwordIsMatch){
    throw new Error("Senha inválida");
  }

  if(data.newPassword !== data.confirmNewPassword){
    throw new Error("As senhas devem ser iguais");
  }

  if(data.newPassword.length <= 6){
    throw new Error("Senha muito fraca, deve haver mais de 6 caracteres");
  }

  const result = UserDAO.changePassword(user, data.newPassword);

  if(!result){
    throw new Error("Erro ao atualizar senha");
  }

  return result.atualizado_em
}

// const serviceListAllUsers = async (req, res) => {
//   try {
//     const con = await connectToDatabase();
//     const sql = "SELECT * FROM users";
//     const [rows] = await con.execute(sql);

//     if(rows.length === 0){
//       return { content: false, listUsers: []};
//     }

//     return { content: true, listUsers: rows}
//   } catch (err) {
//     throw new Error(err.code);
//   }
// };

const serviceFindById = async (id) => {
  const numericId = parseInt(id, 10);

  if(!Number.isInteger(numericId) || numericId <= 0){
    throw new Error("ID de usuário inváido");
  }

  const user = await UserDAO.findById(numericId);

  if(!user){
    throw new Error("Usuário não encontrado");
  }

  return user;
}

module.exports = {
  serviceAuthenticateUser,
  serviceInsertUser,
  // serviceListAllUsers,
  serviceFindById,
  serviceChangePasswordUser
}
