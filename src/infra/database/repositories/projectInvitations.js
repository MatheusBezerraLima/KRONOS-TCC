const { ProjectInvitations } = require("../models/index");

class ProjectInvitationsDAO {
    async create(data){
        return await ProjectInvitations.create(data);
    }

    async findPendingEmailsByProjectId(projectId) {
        const invitations = await ProjectInvitations.findAll({
            where: {
                project_id: projectId,
                status: 'pending'
            },
            attributes: ['invitee_email']
        });
        // Retorna um array simples de strings de e-mail
        return invitations.map(inv => inv.invitee_email);
    }

    async createBulk(invitationsData, options = {}){
        try{
            const newInvitations = await ProjectInvitations.bulkCreate(invitationsData, { transaction: options.transaction });
            return newInvitations;
        }catch(error){
            console.error(`Erro no DAO ao criar convites em massa: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ProjectInvitationsDAO();