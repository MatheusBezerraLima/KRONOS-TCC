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
            
            // Chamar o serviço de criação aqui - ANTES VERIFICAR SE TODOS OS DADOS NECESSÁRIOS ESTÃO SENDO ENVIADOS
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
            console.log("1");
            
            await taskServices.deleteTask(id, 1);
            
            console.log("tarefa apagada!");
            res.json({ response: "Tarefa apagada!!"})    

        }catch(err){
            
        }
    }
}

module.exports = new TasksController();