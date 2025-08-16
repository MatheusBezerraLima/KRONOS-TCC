const tasksDAO = require('../../infra/database/repositories/tasksRepository');

class TaskServices{
    async listAndGroupGeneralTasks(){
        const generalTasks = await tasksDAO.findAllGeneralTasks();
        if(!generalTasks || generalTasks.length === 0){
            return {};
        }

        const tasksByCat = generalTasks.reduce((acc, task) => {
            const categoryName = task.CategoryTask.nome ? task.CategoryTask.nome : 'Outros';

            if(!acc[categoryName]){
                acc[categoryName] = []
            };

            acc[categoryName].push(task);

            return acc;
        }, {});

        return tasksByCat;
    }
}

module.exports = new TaskServices()