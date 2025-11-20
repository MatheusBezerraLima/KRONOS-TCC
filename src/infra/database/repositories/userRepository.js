const { User } = require('../models');
const bycript = require('bcrypt');

class UserDAO {
    async create(data, options = {}){
        try{
            const userData = {
                nome: data.name,
                email: data.email,
                senha: data.password,
                telefone: data.phone,
                role: "user",
                status: "ativo"     
            } 
            return await User.create(userData,{ transaction: options.transaction});
        }catch(error){
            console.error("Erro ao criar usuário:", err);
            throw new Error(`Não foi possível criar o usuário: ${err.message}`);
        }
       
    }

    async findById(id) {
        try{
          return await User.findByPk(id);  
        }catch(error){
            console.error('Erro no DAO ao buscar usuario por ID:', error);
            throw error;
        }  
    }

    async findAll(){
        try{
            return await User.findAll({
                attributes: ["id", "nome", "email", "status", "role"],
                where: {
                    status: "ativo" 
                }
            });
        }catch(error){
            console.error(`Erro no DAO ao buscar todos os usuários:`, error);
            throw error;
        }
        
    }

    async findByName(nome){
        try{
            return await User.findByAll({
                nome: nome,
                status: "ativo"
            })
        }catch(error){
            console.error(`Erro no DAO ao buscar usuário por nome:`, error);
            throw error;
        }
    }

    async findByEmail(email){
        try{
           return await User.findOne({
                where: {
                    email: email,
                    status: "ativo"
                }
            }); 
        }catch(error){
            console.error(`Erro no DAO ao buscar usuário por e-mail:`, error);
            throw error;
        }
        
    }

    async changePassword(user, newPassword){
        try{
            const newPasswordHash = await bycript.hash(newPassword, 10);
            user.senha = newPasswordHash;
            return await user.save();
        }catch(error){
            console.error(`Erro no DAO tentar alterar a senha do usuário:`, error);
            throw error;
        }      
    }

    async update(user, dataToUpdate){
        try{
            await user.set(dataToUpdate);
            await user.save()
            return user;
        }catch(error){
            console.error(`Erro no DAO ao tentar atualizar dados do usuário:`, error);
            throw error;
        }
        
    }

    // Ser substituido por apenas inativar o usuário.
    async delete(user){
        try{
            return await user.destroy();
        }catch(error){
            console.error(`Erro no DAO tentar deletar usuário:`, error);
            throw error;
        } 
    }
}

module.exports = new UserDAO();