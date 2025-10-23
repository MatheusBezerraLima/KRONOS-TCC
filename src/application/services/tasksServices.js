const categoryTaskDAO = require('../../infra/database/repositories/categoryTaskRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const subTaskDAO = require("../../infra/database/repositories/subTaskRepository");
const statusTaskDAO = require('../../infra/database/repositories/statusTaskRepository');
const userDAO = require("../../infra/database/repositories/userRepository");
const { th } = require('zod/v4/locales');
const boardColumnDAO = require('../../infra/database/repositories/boardColumnRepository');
const userProjectRoleDAO = require('../../infra/database/repositories/userProjectRoleRepository');
const sprintDAO = require('../../infra/database/repositories/sprintRepository');

class TaskServices{
    async prepareTasksPageData(userId){

        if(!userId){
            throw new Error("Id do usuário inconsistente");
        }

        const loggedUser = await userDAO.findById(userId);

        if(!loggedUser){
            throw new Error("Necessário autenticação");
        }

        // Buscando no banco todos os dados necessarios
        const [generalTasksInstances, allCategories, allStatus] = await Promise.all([
            tasksDAO.findAllGeneralTasks(userId),
            categoryTaskDAO.findAllCategories(userId),
            statusTaskDAO.findAllStatusTask()
        ]);
        
        const generalTasks = generalTasksInstances.map(instance => instance.get({ plain: true }));
        
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

    async createTask(data){
        // --- Regra de Autorização --
        if(!data.criador_id){
            throw new Error("Sem usuário vinculado! Realize login novamente!");
        }

        if (data.projeto_id) {
            return this._createTaskForProject(data);
        } else {
            // Caso contrário, delega pwara a função de tarefa pessoal
            return this._createPersonalTask(data);
        }
    }

    async deleteTask(taskId, userId){
        
        if(!userId || !taskId){
            console.log("Usuario nao identificado");
            throw new Error("Erro ao indentificar usuário ou tarefa!");
        }

        const [ user, task ] = await Promise.all([
            userDAO.findById(userId),
            tasksDAO.findById(taskId)
        ]);
        
        if(!user){
            console.log("Usuário inexistente");
            throw new Error("Usuário inexistente!");
        }

        if(!task){
            console.log("Tarefa inexistente");
            throw new Error('Tarefa inexistente');
        }

        if(task.criador_id != userId){
            console.log("Não é o criador");
            throw new Error("Somente o criador da tarefa pode apaga-la");
        }

        await tasksDAO.delete(task);

        return;
    }

    async updateTask(taskId, userId, dataToUpdate){
        if(!userId || !taskId){
            console.log("Usuario nao identificado");
            throw new Error("Erro ao indentificar usuário ou tarefa!");
        }
        const [task, user] = await Promisse.all([
            tasksDAO.findById(taskId),
            userDAO.findById(userId)
        ]);

        if(!user){
            throw new Error("Usuário não encontrado!");
        }

        if(!task){
            throw new Error("Tarefa não existe");
        }

        // 🟨 Verificar isso posteriormente para o caso de a tarefa ser de um projeto
        if(task.criador_id != user.id){
            throw new Error("Somente o criador da tarefa pode atualizar")
        }

        const updatedTask = await tasksDAO.update(task, dataToUpdate);

        if(!updatedTask){
            throw new Error("Erro ao atualizar tarefa");
        }

        return updatedTask;
    }

    async _createPersonalTask(data){
        console.log("Criando tarefa pessoal...");
        const taskCreated = await tasksDAO.create(data);

        if(!taskCreated){
            throw new Error("Erro ao criar tarefa!");
        }

        return taskCreated;
    }

    async _createTaskForProject(data){
        console.log("Criando tarefa para o projeto...");
        const {criador_id, projeto_id, coluna_id, assignedMemberIds = [], subTasks = [], sprint_id} = data;

         // 1. AUTORIZAÇÃO: O criador é membro do projeto?
        const membership = await userProjectRoleDAO.findByUserAndProject(criador_id, projeto_id);
        if (!membership) {
            throw new Error("Acesso negado: O usuário não é membro deste projeto.");
        }

        let finalColumnId = coluna_id;
        if(coluna_id){
            const column = await boardColumnDAO.findById(coluna_id);
            if(!column || column.projeto_id !== projeto_id){
                throw new Error("A coluna especificada não pertence a este projeto.");
            }
        }else{
            const firstColumn = await boardColumnDAO.findFirstColumn(projeto_id);
            if (!firstColumn) {
                throw new Error("O projeto não tem colunas de board configuradas.");
            }
            finalColumnId = firstColumn.id;
        }

        const taskDataToCreate = {
            ...data,
            coluna_id: finalColumnId
        };
        const taskCreated = await tasksDAO.create(taskDataToCreate);
        if (!taskCreated) {
            throw new Error("Erro ao salvar a tarefa no banco de dados.");
        }

        // Associondo membros a tarefa
        if (assignedMemberIds.length > 0) {
            // O método 'setMembers' é uma "magia" do Sequelize que vem da
            // associação belongsToMany. Ele lida com a tabela de ligação automaticamente.
            await taskCreated.setAssignedMembers(assignedMemberIds);
        }

        if(subTasks && subTasks.length > 0){            
            // 1. Prepara os dados: Transforma o array de strings num array de objetos
            const subTasksData = subTasks.map(subtask => ({
                titulo: subtask,
                tarefa_id: taskCreated.id, 
                status_id: 0,
                criado_em: new Date(),
            }));

            // 2. Chama o DAO para criar todas as subtarefas de uma só vez (bulk create)
            await subTaskDAO.bulkCreate(subTasksData);
        }
        // Registrar Atividade aqui posteriormente.


        return tasksDAO.findById(taskCreated.id); 
    }

    async moveTask(taskId, newColumnId, currentUserId){
        try{
            if (!taskId || !newColumnId || !currentUserId) {
                const error = new Error("Faltam dados necessários para mover a tarefa.");
                error.statusCode = 400; // Bad Request
                throw error;
            }

            const [task, column] = await Promise.all([
                tasksDAO.findById(taskId),
                boardColumnDAO.findById(newColumnId),
            ])

             if (!task) {
                const error = new Error("Tarefa não encontrada.");
                error.statusCode = 404; // Not Found
                throw error;
            }
            if (!column) {
                const error = new Error("Coluna não encontrada.");
                error.statusCode = 404; // Not Found
                throw error;
            }

            const membership = await userProjectRoleDAO.findByUserAndProject(currentUserId, task.projeto_id);
            if (!membership) {
                const error = new Error("Acesso negado: você não é membro do projeto desta tarefa.");
                error.statusCode = 403; // Forbidden
                throw error;
            }
            
            if (task.projeto_id !== column.projeto_id) {
                const error = new Error("Ação inválida: a tarefa e a coluna de destino pertencem a projetos diferentes.");
                error.statusCode = 400; // Bad Request
                throw error;
            }


            console.log(`Tentando atualizar a tarefa ${taskId} para a coluna ${newColumnId}...`);
            const updatedTask = await tasksDAO.update(task, { coluna_id: newColumnId });
            
            // Adicionamos um log para ver o que o DAO está a retornar
            console.log('Resultado do DAO.update:', updatedTask);

            // Verificação segura: O resultado agora deve ser um objeto de tarefa válido.
            if (!updatedTask) {
                throw new Error("Erro ao mover a tarefa: nenhuma linha foi atualizada.");
            }

            // 6. Retorna a tarefa atualizada
            return tasksDAO.findById(taskId);

        }catch(error){
            if (error.statusCode) {
                throw error;
            }
            console.error("Falha ao mover tarefa:", error);
            const serverError = new Error("Não foi possível mover tarefa.");
            serverError.statusCode = 500;
            throw serverError;
        }
    }

     async assignTaskToSprint(taskId, sprintData) {    
        try {
            const { sprintNumber, sprintStartDate, sprintEndDate } = sprintData;

            // 1. Validação básica
            if (sprintNumber === undefined || sprintNumber === null) {
                const error = new Error("Número do sprint em falta nos dados recebidos.");
                error.statusCode = 400;
                throw error;
            }

            // 2. Encontra a tarefa para obter o ID do projeto
            const task = await tasksDAO.findById(taskId);
            if (!task) {
                const error = new Error("Tarefa não encontrada.");
                error.statusCode = 404;
                throw error;
            }
            if (!task.projeto_id) {
                const error = new Error("Esta tarefa não pertence a um projeto e não pode ser atribuída a um sprint.");
                error.statusCode = 400;
                throw error;
            }

            let sprint = await sprintDAO.findByProjectAndNumber(task.projeto_id, sprintNumber);

            if (!sprint) {
                sprint = await sprintDAO.create(task.projeto_id, sprintNumber, {
                    sprintStartDate,
                    sprintEndDate
                }); // Passa a transação para o create
                console.log(`[Service] Sprint ${sprintNumber} criado com ID ${sprint.id}.`);
            } else {
                 console.log(`[Service] Sprint ${sprintNumber} encontrado com ID ${sprint.id}.`);
            }
            
            await tasksDAO.update(task, { sprint_id: sprint.id });

            // 5. Retorna a tarefa completa e atualizada
            return tasksDAO.findById(taskId); // Re-busca para garantir que temos os dados mais recentes

        } catch (error) {
            // Relança o erro para o controller tratar
            if (error.statusCode) {
                throw error;
            }
            console.error(`Falha no serviço ao atribuir sprint à tarefa ${taskId}:`, error);
            const serverError = new Error("Não foi possível atribuir a tarefa ao sprint.");
            serverError.statusCode = 500;
            throw serverError;
        }
    }

}

module.exports = new TaskServices()