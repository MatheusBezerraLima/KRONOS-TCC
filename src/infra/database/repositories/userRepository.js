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

    async findByAll(){
        return await User.findByAll();
    }

    async findByName(nome){
        return await User.findByAll({
            nome: nome,
            ativo: 1
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
        return await user.save()
    }
}

module.exports = new UserDAO();