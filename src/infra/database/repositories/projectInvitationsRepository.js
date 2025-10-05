const { ProjectInvitations } = require("../models/index");

class ProjectInvitationsDAO {
    async create(data){
        try{
            return await ProjectInvitations.create(data);
        }catch(error){
            console.error(`Erro no DAO ao criar Convite de Projeto ${error.message}`);
            throw error;
        }
    }

    async findPendingEmailsByProjectId(projectId) {
        try{
            const invitations = await ProjectInvitations.findAll({
                where: {
                    project_id: projectId,
                    status: 'pending'
                },
                attributes: ['invitee_email']
            });            
            // Retorna um array simples de strings de e-mail
            return invitations.map(inv => inv.invitee_email);
        }catch(error){
            console.error(`Erro no DAO ao buscar convites pendentes: ${error.message}`);
            throw error;
        }
        
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

    async updateStatus(invitationId, newStatus){
       try {
            const [affectedRows] = await ProjectInvitations.update(
                { status: newStatus }, // Os campos a serem atualizados
                { where: { id: invitationId } } // A condição para encontrar o registo
            );

            if (affectedRows === 0) {
                console.warn(`Tentativa de atualizar o status do convite ID ${invitationId}, mas ele não foi encontrado.`);
            }

            return { affectedRows };
        } catch (error) {
            console.error(`Erro no DAO (Sequelize) ao atualizar status do convite ${invitationId}:`, error);
            throw error;
        }
    }

    async findById(invitationId){
        try{
           return await ProjectInvitations.findByPk(invitationId);
        }catch(error){
            console.error(`Erro no DAO (Sequelize) ao buscar convite por token, ${error.message}`);
            throw error;
        }   
        
    }
}

module.exports = new ProjectInvitationsDAO();