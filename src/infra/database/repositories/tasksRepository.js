const { includes } = require('zod/v4');
const { Task, CategoryTask, StatusTask } = require('../models');

class TasksDAO{
    async findAllGeneralTasks(userId){
        try{
            return await Task.findAll({
                where: {
                    projeto_id: null,
                    criador_id: userId
                },
                include: [
                    {
                        model: CategoryTask, 
                    },
                    {
                        model: StatusTask,
                    },
                    {
                        model: User,
                        as: 'assignedMembers', // Usa o alias da sua associação Task -> User
                        // IMPORTANTE: Seleciona apenas os dados não sensíveis dos membros
                        attributes: ['id', 'nome'],
                        // Inclui o perfil para buscar o avatar
                        include: [{
                            model: Profile,
                            as: 'profile',
                            attributes: ['foto_perfil']
                        }],
                        // 'through: { attributes: [] }' impede que os dados da tabela
                        // de ligação (atribuicao_tarefa) sejam incluídos no resultado.
                        through: { attributes: [] } 
                    }
                ]
            });
        }catch(error){
            console.error(`Erro ao buscar todas as tasks ${error.message}`);
            throw error;           
        }
        
    };

    async create(data){
        try{
            return await Task.create(data);
        }catch(error){
            console.error(`Erro no DAO ao criar Tarefa ${error.message}`);
            throw error;
        }
    };

    async findById(taskId){
        try{
            return await Task.findByPk(taskId);
        }catch(error){
            console.error(`Erro no DAO de Tarefa ao buscar por ID ${error.message}`);
            throw error;
        }
    }
     
    async findByProjectId(projectId){
        try{
             return await Task.findAll({
                where: {
                    projeto_id: projectId
                },
                includes: [
                    {
                     model: CategoryTask    
                    },
                    {
                     model: StatusTask    
                    },
                ]
            })
        }catch(error){
            console.error(`Erro no DAO (Sequelize) ao buscar tarefas por id do projeto, ${error.message}` );
            throw error;
        }
       
    }

    async delete(task){
        return await task.destroy();
    }

    async update(task, dataToUpdate){
        await task.set(dataToUpdate);
        await task.save()
        return task;
    }

     async moveTasksToNewColumn(oldColumnId, newColumnId, options = {}) {
        try {
            // Task.update é usado para operações em massa (bulk update).
            // Ele atualiza todos os registos que correspondem à condição 'where'.
            const [affectedRows] = await Task.update(
                { coluna_id: newColumnId }, // Os novos valores a serem definidos
                {
                    where: {
                        coluna_id: oldColumnId // A condição para encontrar as tarefas a serem movidas
                    },
                    ...options // Passa a transação e outras opções para a query
                }
            );

            console.log(`${affectedRows} tarefas movidas da coluna ${oldColumnId} para a ${newColumnId}.`);
            return [affectedRows];

        } catch (error) {
            console.error(`Erro no DAO ao mover tarefas da coluna ${oldColumnId}:`, error);
            throw error;
        }
    }
}

module.exports = new TasksDAO();