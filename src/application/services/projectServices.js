const userDAO = require("../../infra/database/repositories/userRepository");


class ProjectServices{
    async create({titulo, descricao, categoria, membros, dataTermino}, thisUser){
        if(!thisUser){
            throw new Error("Não foi possivel identificar o usuário");
        }

        const loggedUser = await userDAO.findById(thisUser);

        if(!loggedUser){
            throw new Error("Usuário não encontrado");
        }

        


    }
}

module.exports = new ProjectServices();