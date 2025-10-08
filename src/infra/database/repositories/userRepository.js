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
        return await User.findByPk(id);
    }

    async findAll(){
        return await User.findAll({
           attributes: ["id", "nome", "email", "status", "role"],
           where: {
            status: "ativo" 
           }
        });
    }

    async findByName(nome){
        return await User.findByAll({
            nome: nome,
            status: "ativo"
        })
    }

    async findByEmail(email){
        return await User.findOne({
            where: {
                email: email,
                status: "ativo"
            }
        });
    }

    async changePassword(user, newPassword){
        const newPasswordHash = await bycript.hash(newPassword, 10);
        user.senha = newPasswordHash;
        return await user.save();
    }

    async update(user, dataToUpdate){
        await user.set(dataToUpdate);
        await user.save()
        return user;
    }

    async delete(user){
        return await user.destroy();
    }
}

module.exports = new UserDAO();