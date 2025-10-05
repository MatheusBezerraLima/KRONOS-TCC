const { UserProjectRole } = require("../models/index");
const { User } = require("../models/index");

class UserProjectRoleDAO{
    async create(data,  options = {}){
        return await UserProjectRole.create(data, { transaction: options.transaction });
    }

    async findByUserAndProject(userId, projectId){
        try{
            const association = await UserProjectRole.findOne({
                where: {
                    usuario_id: userId,
                    projeto_id: projectId
                }
            });
            return association;
        }catch(error){
            console.error(`Erro no DAO ao buscar associação: ${error.message}`);
            throw error;
        }
    }

    async findMemberEmailsByProjectId(projectId) {
        const associations = await UserProjectRole.findAll({
            where: { projeto_id: projectId },
            include: [{
                model: User,
                attributes: ['email'],
                required: true // Garante que só venham associações com usuários válidos
            }]
        });
        // Retorna um array simples de strings de e-mail
        return associations.map(assoc => assoc.User.email);
    }

    async findMemberByProjectId(projectId){
        try{
            return await UserProjectRole.findAll({
                where: { projeto_id: projectId },
                include: [{
                    model: User,
                }]
            });
        }catch(error){
            console.error(`Erro no DAO (Role) ao buscar membros de um projeto ${error.message}`);
            throw error;
        }

    }
}

module.exports = new UserProjectRoleDAO();