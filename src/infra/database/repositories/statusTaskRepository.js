const { StatusTask } = require('../models/index');

class StatusTaskDAO {
    async findAllStatusTask(){
        try{
            return await StatusTask.findAll();
        }catch(error){
            console.error(`Erro no DAO ao listar todos os status ${error.message}`);
            throw error;
        }
    }
}

module.exports = new StatusTaskDAO();