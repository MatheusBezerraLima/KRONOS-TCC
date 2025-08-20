const { Task, CategoryTask, StatusTask } = require('../models');

class TasksDAO{
    async findAllGeneralTasks(){
        return await Task.findAll({
            where: {
                projeto_id: null
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
}

module.exports = new TasksDAO();