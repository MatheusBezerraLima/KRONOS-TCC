const UserDAO = require("../../infra/database/repositories/userRepository");

class AdminServices{
    async listAllUsers(){
        const listUsers = await UserDAO.findAll();
        
          if(!listUsers){
            throw new Error("nenhum Usuário");
          }
        
          return listUsers;
    }

    async deleteUserAccount(userId){
        
        const user = await UserDAO.findById(userId);

        if(!user){
            throw new Error("Nenhum user encontrado")
        }

        await UserDAO.delete(user);

        return;
    }

    async findUserById(userId){
        const user = await UserDAO.findById(userId);

        if(!user){
            throw new Error("Nenhum Usuario com esse Id");
        }

        return user;
    }

    async updateUser(userId, dataToUpdate){
        const user = await UserDAO.findById(userId);

        if(!user) {
            throw new Error("Nenhum Usuário");
        }        

        const updatedUser = await UserDAO.update(user, dataToUpdate);

        if(!updatedUser){
            throw new Error("Não atualizado");
        }
        console.log(updatedUser);
        
        return updatedUser;
    }
}

module.exports = new AdminServices();
