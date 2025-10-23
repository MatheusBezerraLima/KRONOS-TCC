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
            // dataForm.criador_id = req.user.id
            // dataForm.criador_id = 11

            const taskCreated = await taskServices.createTask(dataForm);
            res.json(taskCreated);
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

    async moveTask(req, res){
        try{
            const { taskId } = req.params;
            const { newColumnId } = req.body;
            // const currentUserId = req.user.id;
            const currentUserId = 3;
            
            if (!newColumnId) {
                 return res.status(400).json({ message: 'O ID da nova coluna é obrigatório.' });
            }

            const movedTask = await taskServices.moveTask(parseInt(taskId), newColumnId, currentUserId);

            res.status(200).json(movedTask);
        }catch(error){
            console.error("Erro no Controller ao mover tarefa:", error.message);
            const statusCode = error.statusCode || 500;     
            res.status(statusCode).json({ message: error.message });
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

    async assignSprint(req, res) {
        try {
            const { taskId } = req.params;

            // Extrai os dados do sprint enviados pelo n8n no corpo da requisição
            const sprintData = req.body;

             if (!sprintData || sprintData.sprintNumber === undefined || sprintData.sprintNumber === null) {
                 return res.status(400).json({ message: 'Dados do sprint (especificamente sprintNumber) em falta ou inválidos no corpo da requisição.' });
            }

            // 4. Chama o serviço para executar a lógica de negócio
            const updatedTask = await taskServices.assignTaskToSprint(
                parseInt(taskId, 10), // Converte o taskId para número
                sprintData
            );

            // 5. Envia a resposta de sucesso
            res.status(200).json(updatedTask);

        } catch (error) {
            // 6. Trata os erros enviados pelo serviço
            console.error("Erro no Controller ao atribuir sprint:", error.message);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new TasksController();