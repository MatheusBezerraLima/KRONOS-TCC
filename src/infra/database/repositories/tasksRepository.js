const { includes } = require('zod/v4');
const { Task, CategoryTask, StatusTask, SubTask, Profile, User} = require('../models/index');

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
                ]
            });
        }catch(error){
            console.error(`Erro ao buscar todas as tasks ${error.message}`);
            throw error;           
        }
        
    };

    // async findAllGeneralTasks(userId){
    //     try{
    //         return await Task.findAll({
    //             where: {
    //                 projeto_id: null,
    //                 criador_id: userId
    //             },
    //             include: [
    //                 {
    //                     model: CategoryTask,
    //                     attributes: ['id', 'nome'] 
    //                 },
    //                 {
    //                     model: StatusTask,
    //                 },
    //                 {
    //                     model: User,
    //                     as: 'assignedMembers', // Usa o alias da sua associação Task -> User
    //                     // IMPORTANTE: Seleciona apenas os dados não sensíveis dos membros
    //                     attributes: ['id', 'nome'],
    //                     // Inclui o perfil para buscar o avatar
    //                     include: [{
    //                         model: Profile,
    //                         as: 'profile',
    //                         attributes: ['foto_perfil']
    //                     }, {
    //                        model: CategoryTask,
    //                        attributes: [''] 
    //                     }],
                        
    //                     through: { attributes: [] } 
    //                 }
    //             ]
    //         });
    //     }catch(error){
    //         console.error(`Erro ao buscar todas as tasks ${error.message}`);
    //         throw error;           
    //     }
        
    // };
    
    
    async findByIdWithDetails(id) {
        try {
            return await Task.findByPk(id, {
                include: [
                    {
                        model: CategoryTask,
                        as: 'categoryTask' // Use o 'as' definido na sua associação
                    },
                    {
                        model: StatusTask,
                        as: 'statusTask' // Use o 'as' definido na sua associação
                    },
                    {
                        model: SubTask,
                        as: 'subTasks', // Use o 'as' definido na sua associação
                        order: [['criado_em', 'ASC']] // Opcional: ordena as subtarefas
                    },
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
            // 1. O update precisa de AWAIT!
            // O update retorna um array onde o primeiro item é o número de linhas afetadas
            const [affectedRows] = await Task.update(
                {...dataToUpdate},
                {
                    where: {
                        id: taskId
                    }
                }
            );

            // 2. Se atualizou algo, buscamos o objeto COMPLETO
            if(affectedRows > 0){
                // AQUI ESTÁ O SEGREDO: Precisamos dos 'includes'
                // Certifique-se de importar o Model CategoryTask no topo do arquivo
                const updatedTask = await Task.findByPk(taskId, {
                    include: [
                        {
                            model: CategoryTask, // Importe esse Model!
                            as: 'categoryTask', // O mesmo 'as' definido no seu relacionamento (Associations.js ou index.js)
                            attributes: ['id', 'nome', 'cor_fundo', 'cor_texto']
                        }
                        // Se precisar de status ou criador, adicione aqui também
                    ]
                });
                
                return updatedTask;
            }

            return null; // Retorna null se não achou a tarefa para atualizar
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