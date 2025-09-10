const { where } = require("sequelize");
const { Project } = require("../models/index");

class ProjectDAO{
    async create(data){
        return await Project.create(data);
    }
    
}

module.exports = ProjectDAO;