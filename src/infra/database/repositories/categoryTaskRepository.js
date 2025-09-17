const { CategoryTask } = require('../models/index');

class CategoryTaskDAO{
    async bulkCreate(categoriesData, options = {}){
        try{
            const newCategories = await CategoryTask.bulkCreate(categoriesData, {
                transaction: options.transaction,
            });
            return newCategories;
        }catch(error){
            console.error(`Erro no DAO ao criar categorias em massa: ${error.message}`);
            throw error;
        }
        
    }

    async findAllCategories(userId){
        try{
            return await CategoryTask.findAll({
                where: {
                    usuario_id: userId
                }
            });
        }catch(error){
            console.error(`Erro no DAO ao listar categorias: ${error.message}`);
                throw error;
        }
    }

}

module.exports = new CategoryTaskDAO();