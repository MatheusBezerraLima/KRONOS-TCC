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

            const taskCreated = await taskServices.createTask(dataForm);
            res.redirect('/tasks');
        }catch(err){
            console.log("Erro:", err);
        }     

    }

    async updateTask(req, res){
        try{
            const id = req.params.id;
            const dataTask = req.body;
            const userId = req.user.id;

            const updatedTask = await taskServices.updateTask(id, userId, dataTask);
            res.status(201).json({"Status" : "Sucesso", "Task": updatedTask});

        }catch(err){
            console.log("Erro ao atualizar tarefa", err);
            res.status(400).json({"Controller": "UpdateTask" ,"Erro": err})
        }
    }

    async deleteTask(req, res){
        try{
            const { id } = req.params
            const userId = req.user.id
            
            await taskServices.deleteTask(id, userId);
            console.log("resposta de apagar");
            
            res.redirect('/tasks');
        }catch(err){
            res.status(400).json({"Controller": "DeleteTask" ,"Erro": err})
        }
    }
}

module.exports = new TasksController();