const { CategoryTask } = require('../models/index');

class CategoryTaskDAO{
    async create(data){
        try{
            return await CategoryTask.create(data);
        }catch(error){
            console.error(`Erro no DAO ao criar categoria para tarefa:`, error);
            throw error;
        }
    }

    async createBulk(categoriesData, options = {}){
        try{
            return await CategoryTask.bulkCreate(categoriesData, { transaction: options.transaction });
        }catch(error){
            console.error(`Erro no DAO ao criar categorias em massa: ${error.message}`);
            throw error;
        }
    }

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

    async findAllByProjectId(projectId){
        try{
          return await CategoryTask.findAll({
                where: {
                    projeto_id: projectId
                }
            })  
        }catch(error){
            console.error(`Erro no DAO ao buscar categorias por id do projeto: ${error.message}`);
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

    async findAllByUserId(userId){
        try{
          return await CategoryTask.findAll({
                where: {
                    usuario_id: userId
                }
            })  
        }catch(error){
            console.error(`Erro no DAO ao buscar categorias por id do usuário: ${error.message}`);
            throw error;
        }   
    }

}

module.exports = new CategoryTaskDAO();