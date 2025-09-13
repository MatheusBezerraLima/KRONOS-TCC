const { where, Transaction } = require("sequelize");
const { Project } = require("../models/index");

class ProjectDAO{
    async create(projectData, options = {}){
        return await Project.create(projectData, { transaction: options.transaction});
    }
    async findById(projectId){
        return await Project.findByPk(projectId);
    }
}

module.exports = new ProjectDAO();