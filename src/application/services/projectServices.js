
const sequelize = require("../../config/database");
const userDAO = require("../../infra/database/repositories/userRepository");
const projectDAO = require("../../infra/database/repositories/projectRepository");
const userProjectRoleDAO = require('../../infra/database/repositories/userProjectRoleRepository');
const projectInvitationsDAO = require('../../infra/database/repositories/projectInvitations');


class ProjectServices{
    
    async create({titulo, descricao, dataTermino}, userId){
        if(!userId){
            throw new Error("ID do usuário não fornecido");
        }
        
        const t = await sequelize.transaction();

        try{
            const newProject = await projectDAO.create({
                titulo, 
                descricao,
                "criador_id": userId,
                "data_termino": dataTermino
            }, {transaction: t});


            await userProjectRoleDAO.create({
                "usuario_id": userId,
                "project_id": newProject.id,
                "role": "Criador" 
            }, { transaction: t });

            await t.commit();

            return newProject.get({plain: true});
        }catch(error){
            await t.rollback();

            console.error("Falha ao criar projeto", error);
            throw new Error("Não foi possível criar o projeto. A operação foi revertida.");
        }
    }

    async addMember(projectId, userIdToAdd, currentUserId, role ){
        
        // O usuário atual tem permissão de adicionar novos membros? 
        const currentUserRole = await userProjectRoleDAO.findByUserAndProject(currentUserId, projectId);

        if (!currentUserRole || !['Criador', 'Administrador'].includes(currentUserRole.role)) {
            throw new Error("Acesso negado: você não tem permissão para adicionar membros a este projeto.");
        }

         // O usuário a ser adicionado já é membro do projeto?
        const existingAssociation = await userProjectRoleDAO.findByUserAndProject(userIdToAdd, projectId);

        if (existingAssociation) {
            throw new Error("Este usuário já é membro do projeto.");
        }

        const newMember = await userProjectRoleDAO.create({
            usuario_id: userIdToAdd,
            project_id: projectId,
            role: role || "Membro"
        });

        return newMember.get({plain: true});
    }

    async inviteMembersToProject(projectId, emails, role, inviterId){
        // 1. AUTORIZAÇÃO: O usuário pode convidar? 
        const inviterMemberShip = await userProjectRoleDAO.findByUserAndProject(inviterId, projectId);
        if(!inviterMemberShip || !["Criador", "Administrador"].includes(inviterMemberShip.role)){
            const error = new Error("Acesso negado: Você não tem permissão para convidar membros");
            error.statusCode = 403; // Forbidden
            throw error;
        }

        // 2. LIMPANDO DADOS: Remove emails duplicados e o próprio email do remetente
        const inviter = await userDAO.findById(inviterId);
        const uniqueEmails  = [...new Set(emails.filter(email => email !== inviter.email))];

        if (uniqueEmails.length === 0) {
            return { invitationsSent: [], alreadyMembers: [], alreadyInvited: [], invalidEmails: [] };
        }

        // 3. BUSCA DE DADOS EXISTENTES: Pega membros e convites pendentes de uma vez
        const [existingMemberEmails, pendingInviteEmails] = await Promise.all([
            userProjectRoleDAO.findMemberEmailsByProjectId(projectId),
            projectInvitationsDAO.findPendingEmailsByProjectId(projectId)
        ]);

        const existingMembersSet = new Set(existingMemberEmails);
        const pendingInvitesSet = new Set(pendingInviteEmails);

        // 4. FILTRAGEM INTELIGENTE: Separa os e-mails
        const results = {
            invitationsSent: [],
            alreadyMembers: [],
            alreadyInvited: [],
        };
        const emailsToInvite = [];

        for(const email of uniqueEmails){
            if(existingMembersSet.has(email)){
                results.alreadyMembers.push(email);
            } else if (pendingInvitesSet.has(email)){
                results.alreadyInvited.push(email);
            }else{
                // Emails para enviar
                emailsToInvite.push(email);
            }
        }

        // 5. AÇÃO DO BANCO: Cria apenas os convites válidos
        if(emailsToInvite.length > 0){
            const invitationsData = emailsToInvite.map(email => ({
                project_id: projectId,
                inviter_id: inviterId,
                invitee_email: email,
                role_to_assign: role || "Membro",
                status: "pending"
            }));

            const newInvitations = await projectInvitationsDAO.createBulk(invitationsData);
            results.invitationsSent = newInvitations.map( email => inv.invitee_email);

            // 6. ENVIO DE E-MAILS: Dispara os e-mails (pode ser em segundo plano)
            // for (const invitation of newInvitations) {
            //     await emailService.sendProjectInvitation(invitation);
            // }
        }

        return results;
    }
}

module.exports = new ProjectServices();