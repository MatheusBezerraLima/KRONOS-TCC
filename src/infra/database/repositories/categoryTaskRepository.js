const { CategoryTask } = require('../models/index');

class CategoryTaskDAO{
    async findAllCategories(userId){
        return await CategoryTask.findAll({
            where: {
                usuario_id: userId
            }
        });
    }
}

module.exports = new CategoryTaskDAO();