const { Task, CategoryTask, StatusTask } = require('../models');

class TasksDAO{
    async findAllGeneralTasks(userId){
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
    };

    async createNewTask(data){
        return await Task.create(data);
    };

    async findById(taskId){
        return await Task.findByPk(taskId);
    }

    async deleteTask(task){
        return await task.destroy();
    }
}

module.exports = new TasksDAO();