const { SubTask } = require('../models/index');

class SubTaskDAO {
    async create(dataSubTask){
        try{
            return await SubTask.create(dataSubTask);
        }catch(error){
            console.error('Erro no DAO ao criar subtarefa:', error);
            throw error;
        }
    }

    async findAllByTaskIds(taskIds){
         if (!taskIds || taskIds.length === 0) {
            return []; // Retorna um array vazio se não houver IDs para procurar
        }

        try {
            const subTasks = await SubTask.findAll({
                where: {
                    tarefa_id: { // Certifique-se de que o nome da coluna está correto
                        [Op.in]: taskIds
                    }
                }
            });
            return subTasks;
        } catch (error) {
            console.error('Erro no DAO ao buscar subtarefas por múltiplos IDs:', error);
            throw error;
        }
    }
}

module.exports = new SubTaskDAO();