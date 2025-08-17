const taskServices = require('../../application/services/tasksServices');

class TasksController{

    async prepareTasksPageData(req, res){
        try{
            const {groupedTasks, allCategories, allStatus} = await taskServices.prepareTasksPageData();
            res.render('tasks/index', {generalTasks: groupedTasks, allCategories: allCategories, allStatus: allStatus});
        }catch(err){
            console.log("erro na listagem de tarefas", err);
        }
    }

    async createTask(req, res){
        try{
            const dataForm = req.body;

            
        }catch(err){
            console.log("Erro a criar tarefa");
        }     

    }

    async updateTask(req, res){

    }

    async deleteTask(req, res){
        
    }
}

module.exports = new TasksController();