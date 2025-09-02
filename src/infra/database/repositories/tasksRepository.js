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

    async create(data){
        return await Task.create(data);
    };

    async findById(taskId){
        return await Task.findByPk(taskId);
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