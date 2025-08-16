const { Task, CategoryTask } = require('../models');

class TasksDAO{
    async findAllGeneralTasks(){
        return await Task.findAll({
            where: {
                projeto_id: { [Op.is]: null}
            },
            include: [{
                model: CategoryTask,
            }]
        });
    };
}

module.exports = new TasksDAO();