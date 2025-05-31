const User = require('../../models/userModel');

class UserDAO {
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

    async create(data){
        return User.create(data);
    }
    
}

module.exports = new UserDAO();