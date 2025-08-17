const categoryTaskDAO = require('../../infra/database/repositories/categoryTaskRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const statusTaskDAO = require('../../infra/database/repositories/statusTaskRepository');

class TaskServices{
    async prepareTasksPageData(){
        // Buscando no banco todos os dados necessarios
        const [generalTasks, allCategories, allStatus] = await Promise.all([
            tasksDAO.findAllGeneralTasks(),
            categoryTaskDAO.findAllCategories(),
            statusTaskDAO.findAllStatusTask()
        ]);

        // Chamando uma função privada para organizar as tarefas por cateorias
        const groupedTasks = this._groupTasksByCategory(generalTasks);

        return {
            groupedTasks,
            allCategories,
            allStatus
        };
    }

    _groupTasksByCategory(tasks){
        if(!tasks || tasks === 0){
            return{};
        }

        return tasks.reduce((acc, task) => {
            const categoryName = task.CategoryTask.nome ? task.CategoryTask.nome : 'Outros';
            if(!acc[categoryName]){
                acc[categoryName] = []
            };
            acc[categoryName].push(task);
            return acc;
        }, {});
    }

}

module.exports = new TaskServices()