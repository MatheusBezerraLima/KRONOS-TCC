const taskServices = require('../../application/services/tasksServices');

class TasksController{

    async listGeneralTasks(req, res){
        try{
            const tasksByCat = await taskServices.listAndGroupGeneralTasks();
            console.log(tasksByCat);
        }catch(err){
            console.log("erro na listagem de tarefas");
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