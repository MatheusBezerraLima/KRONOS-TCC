const { UserProjectRole } = require("../models/index");

class UserProjectRoleDAO{
    async create(data){
        return await UserProjectRole.create(data);
    }

    async findByUserAndProject(userId, projectId){
        try{
            const association = await UserProjectRole.findOne({
                where: {
                    usuario_id: userId,
                    project_id: projectId
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
}

module.exports = new UserProjectRoleDAO();