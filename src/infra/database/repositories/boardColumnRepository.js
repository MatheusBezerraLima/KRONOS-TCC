const { BoardColumn } = require("../models/index");

class BoardColumnDAO {
    async createBulk(columnsData, options = {}){
        try{
            return await BoardColumn.bulkCreate(columnsData, { transaction: options.transaction });
        }catch(error){
            console.error(`Erro no DAO ao criar colunas em massa: ${error.message}`);
            throw error;
        }
    }

    async findByProjectId(projectId){
        try{
          return await BoardColumn.findAll({
                where: {
                    projeto_id: projectId
                }
            })  
        }catch(error){
            console.error(`Erro no DAO ao buscar colunas por id do projeto: ${error.message}`);
            throw error;
        }
        
    }

    async create(columnData){
        try{
           return await BoardColumn.create(columnData); 
        }catch(error){
            console.error(`Erro no DAO ao criar coluna: ${error.message}`);
            throw error;
        }
        
    }
}

module.exports = new BoardColumnDAO();
