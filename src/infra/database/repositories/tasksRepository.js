const { includes } = require('zod/v4');
const { Task, CategoryTask, StatusTask, SubTask, User, BoardColumn, ProfileUser} = require('../models/index');

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
                        as: "categoryTask"    
                    },
                    {
                        model: StatusTask,
                        as: "statusTask"
                    },
                    {
                        model: BoardColumn,
                        as: "coluna"
                    },// --- INCLUINDO MEMBROS ---
                    {
                        model: User,
                        as: 'assignedMembers', // Alias definido na associação (Task.belongsToMany User)
                        attributes: ['id', 'nome'],
                        include: [{
                            model: ProfileUser,
                            as: 'profile',
                            attributes: ['foto_perfil']
                        }],
                        // 'through: { attributes: [] }' remove os dados da tabela de ligação (assignmentTask) do retorno JSON, deixando mais limpo
                        through: { attributes: [] } 
                    }
                ]
            });
        }catch(error){
            console.error(`Erro ao buscar todas as tasks ${error.message}`);
            throw error;           
        }
        
    };
    
    
    async findByIdWithDetails(id) {
        try {
            return await Task.findByPk(id, {
                include: [
                    {
                        model: CategoryTask,
                        as: 'categoryTask' 
                    },
                    {
                        model: StatusTask,
                        as: 'statusTask' 
                    },
                    {
                        model: SubTask,
                        as: 'subTasks',
                        order: [['criado_em', 'ASC']] 
                    },
                    {
                        model: BoardColumn,
                       as: "coluna"
                    },// --- INCLUINDO MEMBROS ---
                    {
                        model: User,
                        as: 'assignedMembers',
                        attributes: ['id', 'nome'],
                        include: [{
                            model: ProfileUser,
                            as: 'profile',
                            attributes: ['foto_perfil']
                        }],
                        through: { attributes: [] } 
                    }
                ],
            });
        } catch (error) {
            console.error(`Erro no DAO ao buscar tarefa por ID com detalhes (ID: ${id}):`, error);
            throw error;
        }
    }

    async create(data){
        try{
            const newTask = await Task.create(data);
            await newTask.reload({
                include: [
                    {
                        model: CategoryTask, 
                        as: "categoryTask"    
                    },
                    {
                        model: StatusTask,
                        as: "statusTask"
                    },
                    {
                        model: BoardColumn,
                        as: "coluna"
                    },// --- INCLUINDO MEMBROS ---
                    {
                        model: User,
                        as: 'assignedMembers', 
                        attributes: ['id', 'nome'],
                        include: [{
                            model: ProfileUser,
                            as: 'profile',
                            attributes: ['foto_perfil']
                        }],
                        through: { attributes: [] } 
                    }
                ]
            });
            return newTask;
        }catch(error){
            console.error(`Erro no DAO ao criar Tarefa ${error.message}`);
            throw error;
        }
    };

    async findById(taskId){
        try{
            return await Task.findByPk(taskId, {
                include: [
                    {
                        model: CategoryTask,
                        as: 'categoryTask'
                    }
                ]
            });
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
                include: [
                    {
                        model: CategoryTask,
                        as: 'categoryTask'
                    },
                    {
                        model: StatusTask,
                        as: "statusTask"
                    },
                    {
                        model: BoardColumn,
                        as: "coluna"
                    },// --- INCLUINDO MEMBROS ---
                    {
                        model: User,
                        as: 'assignedMembers', 
                        attributes: ['id', 'nome'],
                        include: [{
                            model: ProfileUser,
                            as: 'profile',
                            attributes: ['foto_perfil']
                        }],
                        through: { attributes: [] } 
                    }
                ]
            })
        }catch(error){
            console.error(`Erro no DAO (Sequelize) ao buscar tarefas por id do projeto, ${error.message}` );
            throw error;
        }
       
    }

    async delete(task){
        try{
            return await task.destroy()
        }catch(error){
            console.error(`Erro no DAO tentar deletar tarefa:`, error);
            throw error;
        }
    }

async update(taskId, dataToUpdate){
        try{
           
            const [affectedRows] = await Task.update(
                {...dataToUpdate},
                {
                    where: {
                        id: taskId
                    }
                }
            );
            
            
            if(affectedRows > 0){
                const updatedTask = await Task.findByPk(taskId, {
                    include: [
                        {
                            model: CategoryTask, 
                            as: 'categoryTask', 
                            attributes: ['id', 'nome', 'cor_fundo', 'cor_texto']
                        }
                       
                    ]
                });
                
                return updatedTask;
            }

            return null; 
        } catch(error){
            console.error(`Erro no DAO ao tentar atualizar tarefa:`, error);
            throw error;
        }
    }

     async moveTasksToNewColumn(oldColumnId, newColumnId, options = {}) {
        try {
            const [affectedRows] = await Task.update(
                { coluna_id: newColumnId }, 
                {
                    where: {
                        coluna_id: oldColumnId 
                    },
                    ...options 
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
