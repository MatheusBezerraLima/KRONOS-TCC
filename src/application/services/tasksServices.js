const categoryTaskDAO = require('../../infra/database/repositories/categoryTaskRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const statusTaskDAO = require('../../infra/database/repositories/statusTaskRepository');
const userDAO = require("../../infra/database/repositories/userRepository");
const { th } = require('zod/v4/locales');

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

        }

        const taskCreated = await tasksDAO.create(data);

        if(!taskCreated){
            throw new Error("Erro ao criar tarefa!");
        }

        return taskCreated;

        // --- Regra de Integridade --
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

    _createTaskOfProject(data){
        
    }

}

module.exports = new TaskServices()