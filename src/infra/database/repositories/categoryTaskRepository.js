const { CategoryTask } = require('../models/index');

class CategoryTaskDAO{
    async findAllCategories(){
        return await CategoryTask.findAll();
    }
}

module.exports = new CategoryTaskDAO();