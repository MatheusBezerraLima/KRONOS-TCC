const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const UserDAO = require('../../infra/database/repositories/userRepository');
const profileUserDAO = require('../../infra/database/repositories/profileUserRepository');
const sequelize = require("../../config/database");
const categoryTask = require("../../infra/database/repositories/categoryTaskRepository");


const serviceInsertUser = async (data) => {
  // Iniciando uma transação
    const t = await sequelize.transaction();
  try {
    // Aplicar regras de negócio aqui... 
    const user = await UserDAO.findByEmail(data.email);
    if(user){
      throw new Error("Usuário já existe");
    }

    // Criptografando a senha
    const passwordHash = await bcrypt.hash(data.password, 10);
    data.password = passwordHash;

    const newUser = await UserDAO.create(data, { transaction: t });

    // Criando o perfil do usuário
    const imageUrl = `https://ui-avatars.com/api/?name=${newUser.nome}&background=random`
    const profileUser = await profileUserDAO.create({usuario_id: newUser.id, foto_perfil: imageUrl}, {transaction: t});
    
    console.log("Profile", profileUser);
      
    const defaultCategories = [
      {nome: "Pessoal", usuario_id: newUser.id, cor_fundo: "#D0F8FF", cor_texto: "#00BCD4"},
      {nome: "Estudos", usuario_id: newUser.id, cor_fundo: "#FFF8E1", cor_texto: "#FF8F00"},
      {nome: "Trabalho", usuario_id: newUser.id, cor_fundo: "#F3E5F5", cor_texto: "#7B1FA2"},
    ];

    // Insere todas as categorias de uma vez (bulkCreate) DENTRO da transação
    await categoryTask.bulkCreate(defaultCategories, { transaction: t });

    // Se tudo der  certo aqui, confirma a transação
    await t.commit();

    // Retorna o usuário criado (sem a senha, por segurança)
    const result = newUser.get({ plain: true });
    delete result.senha;

    return result;

  } catch (err) {
    await t.rollback();
    console.error("Erro ao criar usuário e categorias:", err);
    throw new Error(`Não foi possível criar o usuário: ${err.message}`);
  }
};

const serviceAuthenticateUser = async (data) => {
  // busca o usuario no banco
    const user = await UserDAO.findByEmail(data.email)

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // verificando compatibilidade da senha
    const passwordIsMatch = await bcrypt.compare(data.password, user.senha);

    if(!passwordIsMatch){
      throw new Error("INVALID_PASSWORD");
    }
    
    // Criando um "corpo" para o token de autenticação
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    // Criando o token utilizando o  payload e a chave secreta 
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '30m'
    })
    
    return {user, token};
};

const serviceChangePasswordUser = async(data) => {
  const user = await UserDAO.findById(data.userId);
  if(!user){
    throw new Error("Usuário não encontrado.");
  }

  // Verificando a senha com bycript
  const passwordIsMatch = await bcrypt.compare(data.currentPassword, user.senha);
  if(!passwordIsMatch){
    throw new Error("Senha inválida");
  }

  // Confirmação de nova senha falhou
  if(data.newPassword !== data.confirmNewPassword){
    throw new Error("As senhas devem ser iguais.");
  }

  // Senhas com menos de 8 caracteres serão consideradas inseguras
  if(data.newPassword.length < 8){
    throw new Error("A nova senha deve ter no mínimo 8 caracteres.");
  }

  // Chamando o DAO com 'await' para salvar o resultado
  const updatedUser = await UserDAO.changePassword(user, data.newPassword);

  return updatedUser;
}

const serviceListAllUsers = async () => {
  const listUsers = await UserDAO.findAll();

  if(!listUsers){
    throw new Error("nenhum Usuário");
  }

  return listUsers;
}

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

const serviceFindByEmail = async(email) => {  
  const user = UserDAO.findByEmail(email);

  if(!user){
    throw new Error("Usuário não encontrado")
  }

  return user;

}

const searchUsersByName = async(termo) => {
  try {
      if (!termo || termo.trim().length === 0) {
          return [];
      }

      const users = await UserDAO.findByName(termo);

      return users;

  } catch (error) {
      console.error("Erro no Service ao pesquisar usuários:", error.message);
      throw new Error("Falha ao buscar usuários.");
  }
}

module.exports = {
  serviceAuthenticateUser,
  serviceInsertUser,
  serviceListAllUsers,
  serviceFindById,
  serviceFindByEmail,
  serviceChangePasswordUser,
  searchUsersByName
}
