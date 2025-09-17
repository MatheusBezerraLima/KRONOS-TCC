const { where, Transaction } = require("sequelize");
const { Project } = require("../models/index");

class ProjectDAO{
    async create(projectData, options = {}){
        try{
            return await Project.create(projectData, { transaction: options.transaction});
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
}

module.exports = new ProjectDAO();