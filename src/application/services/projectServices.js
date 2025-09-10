const userDAO = require("../../infra/database/repositories/userRepository");


class ProjectServices{
    async create({titulo, descricao, membros, dataTermino}, userId){
        if(!userId){
            throw new Error("Não foi possivel identificar o usuário");
        }

        const loggedUser = await userDAO.findById(userId);

        if(!loggedUser){
            throw new Error("Usuário não encontrado");
        }

        if(membros && membros.length > 0){
        
        }
    }

    _associateUserToProject(membros){
        membros.forEach(membro => {
            
        });
    }
}

module.exports = new ProjectServices();