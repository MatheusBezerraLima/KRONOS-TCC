const { where, Transaction } = require("sequelize");
const { Project, CategoryTask} = require("../models/index");

class ProjectDAO{
    async create(projectData, options = {}){
        try{
            const newProject = await Project.create(projectData, { transaction: options.transaction});

            await newProject.reload({
                include: [
                    {
                        model: CategoryTask, 
                        as: "categoryTask"    
                    },
                ],
                transaction: options.transaction
            });
            return newProject;
        }catch(error){
            console.error(`Erro no DAO ao criar Projeto ${error.message}`);
            throw error;
        }
    }

    async findById(projectId){
        try{
            return await Project.findByPk(projectId);
        }catch(error){
            console.error(`Erro no DAO ao buscar Projeto por ID ${error.message}`);
            throw error;
        }
    }

    async delete(projectId){
        try{
            return await Project.destroy({
                where:{
                    id: projectId
                }
            })
        }catch(error){
            console.error(`Erro no DAO ao tentar deletar o projeto`, error);
            throw error;
        }
    }

    async update(projectId, data){
        try{
            const result = await Project.update(
                { ...data }, // Copia os dados de forma segura
                {
                    where: {
                        id: projectId
                    }
                }
            );

            if(result[0] > 0 ){
                const updatedProject = await Project.findById(projectId);
                return updatedProject;
            }

            return result;
        }catch(error){
            console.error(`Erro no DAO ao tentar atualizar dados do projeto`, error);
            throw error;
        }
    }
}

module.exports = new ProjectDAO();