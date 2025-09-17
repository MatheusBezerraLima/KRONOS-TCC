const { Task, CategoryTask, StatusTask } = require('../models');

class TasksDAO{
    async findAllGeneralTasks(userId){
        try{
            return await Task.findAll({
                where: {
                    projeto_id: null,
                    criador_id: userId
                },
                include: [
                    {
                        model: CategoryTask, 
                    },
                    {
                        model: StatusTask,
                    }
                ]
            });
        }catch(error){
            console.error(`Erro ao buscar todas as tasks ${error.message}`);
            throw error;           
        }
        
    };

    async create(data){
        try{
            return await Task.create(data);
        }catch(error){
            console.error(`Erro no DAO ao criar Tarefa ${error.message}`);
            throw error;
        }
    };

    async findById(taskId){
        try{
            return await Task.findByPk(taskId);
        }catch(error){
            console.error(`Erro no DAO de Tarefa ao buscar por ID ${error.message}`);
            throw error;
        }
    }

    async delete(task){
        return await task.destroy();
    }

    async update(task, dataToUpdate){
        await task.set(dataToUpdate);
        await task.save()
        return task;
    }
}

module.exports = new TasksDAO();