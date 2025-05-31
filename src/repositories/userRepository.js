const User = require('../models/userModel');

class UserDAO {
    async findById(id) {
        return await User.findByPk(id);
    }

    async create(data){
        return User.create(data);
    }
}

module.exports = new UserDAO();