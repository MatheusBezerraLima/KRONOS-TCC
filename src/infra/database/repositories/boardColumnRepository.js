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

    async findById(columnId){
        try{
          return await BoardColumn.findByPk(columnId);  
        }catch(error){
            console.error(`Erro no DAO ao buscar coluna por id: ${error.message}`);
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

      async update(id, data, options = {}) {
        return BoardColumn.update(data, { where: { id }, ...options });
    }

    async delete(id, options = {}) {
        return BoardColumn.destroy({ where: { id }, ...options });
    }

    /**
     * Encontra a coluna com a maior ordem num projeto.
     * Útil para saber onde adicionar a próxima.
     */
    async findLastByProjectId(projectId, options = {}) {
        return BoardColumn.findOne({
            where: { projeto_id: projectId },
            order: [['ordem', 'DESC']],
            ...options
        });
    }

    async findFirstColumn(projectId, options = {}) {
        try {
            return await BoardColumn.findOne({
                where: {
                    projeto_id: projectId
                },
                order: [
                    ['ordem', 'ASC'] // Ordena pela 'ordem' do menor para o maior
                ],
                ...options // Passa a transação e outras opções
            });
            // O findOne, combinado com a ordenação, garante que pegamos
            // a coluna com a menor 'ordem'.
        } catch (error) {
            console.error(`Erro no DAO ao buscar a primeira coluna do projeto ${projectId}:`, error);
            throw error;
        }
    }
}

module.exports = new BoardColumnDAO();
