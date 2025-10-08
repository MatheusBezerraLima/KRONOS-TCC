const profileUserDAO = require('../../infra/database/repositories/profileUserRepository');

class ProfileUserService{
    async create(userId, userName){
        try{
            console.log(userId, userName);
            
            if(!userId){
                const error = new Error("Erro ao criar o perfil do usuário - ID não fornecido");
                error.statusCode = 400
                throw error;
            }
            const imageUrl = `https://ui-avatars.com/api/?name=${userName}&background=random`

            const profileUser = await profileUserDAO.create({usuario_id: userId, foto_perfil: imageUrl});

            return { action: "created", data: profileUser};
        }catch(error){
            console.error("Erro ao criar perfil do usuário:", err);
            throw new Error(`Não foi possível criar o perfil do usuário: ${err.message}`);
        }
    }
}

module.exports = new ProfileUserService();