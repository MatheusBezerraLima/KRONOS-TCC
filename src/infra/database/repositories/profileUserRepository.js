const { NOW } = require("sequelize");
const { ProfileUser } = require("../models/index");

class ProfileUserDAO {
    async create(data, options = {}){
        try{
            const dataProfile = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            return await ProfileUser.create(dataProfile, { transaction: options.transaction });
        }catch(error){
            console.error(`Erro no DAO ao criar perfil do usuário ${error.message}`);
            throw error;
        }
    }

    async findByIdUser(userId){
        return await ProfileUser.findOne({
            where: {
                usuario_id: userId
            }
        })
    }

    async findAll(){
         const result = await ProfileUser.findAll();
         console.log(result);
         return result;
    }
}

module.exports = new ProfileUserDAO();