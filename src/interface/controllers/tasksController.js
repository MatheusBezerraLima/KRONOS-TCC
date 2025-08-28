const taskServices = require('../../application/services/tasksServices');

class TasksController{

    async prepareTasksPageData(req, res){
        try{
            const userId = req.user.id            
            const {groupedTasks, allCategories, allStatus} = await taskServices.prepareTasksPageData(userId);            
            res.render('tasks/index', {generalTasks: groupedTasks, allCategories: allCategories, allStatus: allStatus});
        }catch(err){
            console.log("erro na listagem de tarefas", err);
        }
    }

    async createTask(req, res){
        try{
            const dataForm = req.body;
            dataForm.criador_id = req.user.id
            console.log(dataForm);
            
            const taskCreated = await taskServices.createTask(dataForm);
             
            res.redirect('/tasks');
        }catch(err){
            console.log("Erro:", err);
        }     

    }

    async updateTask(req, res){

    }

    async deleteTask(req, res){
        try{
            const { id } = req.params
            const userId = req.user.id
            console.log(userId);
            
            await taskServices.deleteTask(id, userId);
            console.log("resposta de apagar");
            
            res.redirect('/tasks');
        }catch(err){
            
        }
    }
}

module.exports = new TasksController();