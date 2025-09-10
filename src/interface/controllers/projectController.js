const projectServices = require("../../application/services/projectServices");

class ProjectController{
    async create(req, res){
        const {titulo, descricao, categoria, membros, dataTermino} = req.body;
        const user = req.user.id;  
        const project = await  projectServices.create({titulo, descricao, categoria, membros, dataTermino}, user);
        
    }
}

module.exports = new ProjectController();