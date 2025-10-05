const jwt = require("jsonwebtoken");
const projectInvitationsDAO = require('../../infra/database/repositories/projectInvitationsRepository');
const userDAO = require("../../infra/database/repositories/userRepository");
const userProjectRoleDAO = require("../../infra/database/repositories/userProjectRoleRepository");

const SECRET = process.env.SECRET;

class  InviteService{
    async accept(token, loggedUser){
        // Vericar token
        if(!token){
            const error = new Error("Token de convite não fornecido.");
            error.statusCode = 400;
            throw error;
        }

        const payload = jwt.verify(token, SECRET);
        const { invitationId } = payload

        console.log("🚀Payload: ", payload);
        console.log("⭕", invitationId);

        const invitation = await projectInvitationsDAO.findById(invitationId); 

        if( !invitation || invitation.status !== "pending" ){
            const error = new Error("Convite inválido ou já não está pendente.");
            error.statusCode = 400;
            throw error;
        }

        if(loggedUser){
            if(loggedUser.email != invitation.invitee_email ){
                const error = new Error('Este convite é para outro utilizador.');
                error.statusCode = 403; // Forbidden
                throw error;
            }

            return this._processAcceptance(invitation, loggedUser);
        }else{
            return {action: 'redirect_login', data: { inviteToken: token}}
        }
    }

    async _processAcceptance(invitation, user){
        await userProjectRoleDAO.create({
            "usuario_id": user.id,
            "projeto_id": invitation.project_id,
            "role": invitation.role_to_assign 
        })
        await projectInvitationsDAO.updateStatus(invitation.id, 'accepted');  // Criar

        return { action: 'accepted', data: { projectId: invitation.project_id } };
    }
}

module.exports = new InviteService();