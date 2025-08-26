const categoryTaskDAO = require('../../infra/database/repositories/categoryTaskRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const statusTaskDAO = require('../../infra/database/repositories/statusTaskRepository');
const userDAO = require("../../infra/database/repositories/userRepository");

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

        const loggedUser = await userDAO.findById(data.criador_id);

        if(!loggedUser){
            throw new Error("Usuário sem permissão!");
        }

        // Verificando se a tarefa é de um projeto ou individual7
        // Trabalhar nessa verificação posteriormente
        if(data.projeto_id){
            const response = this._createTaskOfProject(data);

            if(!response){
                throw new Error('Erro ao criar tarefa para o projeto');
            }

            return response;
        }

        const taskCreated = await tasksDAO.createNewTask(data);

        if(!taskCreated){
            throw new Error("Erro ao criar tarefa!");
        }

        return taskCreated;

        // --- Regra de Integridade --
    }

    async deleteTask(taskId, userId){
        if(!userId || !taskId){
            throw new Error("Erro ao indentificar usuário ou tarefa!");
        }
        console.log("2");

        // const task = await tasksDAO.findById(taskId);
        const [ user, task ] = await Promise.all([
            userDAO.findById(userId),
            tasksDAO.findById(taskId)
        ]);
        
        if(!user){
            throw new Error("Usuário inexistente!");
        }

        if(!task){
            throw new Error('Tarefa inexistente');
        }

        if(task.criador_id != userId){
            throw new Error("Somente o criador da tarefa pode apaga-la");
        }

        await tasksDAO.deleteTask(task);

        return;
    }

    _createTaskOfProject(){}

}

module.exports = new TaskServices()