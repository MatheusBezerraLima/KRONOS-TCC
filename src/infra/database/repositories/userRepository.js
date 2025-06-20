const { User } = require('../models');
const bycript = require('bcrypt');

class UserDAO {
    async create(data){
        const userData = {
            ...data,
            role: "user",
            status: "ativo"     
        } 
        return User.create(userData);
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