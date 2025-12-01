
const sequelize = require("../../config/database");
const jwt = require("jsonwebtoken");
const userDAO = require("../../infra/database/repositories/userRepository");
const projectDAO = require("../../infra/database/repositories/projectRepository");
const taskDAO = require('../../infra/database/repositories/tasksRepository');
const subTaskDAO = require("../../infra/database/repositories/subTaskRepository");
const sprintDAO = require('../../infra/database/repositories/sprintRepository');
const boardColumnDAO = require('../../infra/database/repositories/boardColumnRepository');
const categoryDAO = require('../../infra/database/repositories/categoryTaskRepository');
const userProjectRoleDAO = require('../../infra/database/repositories/userProjectRoleRepository');
const projectInvitationsDAO = require('../../infra/database/repositories/projectInvitationsRepository');
const categoryTaskDAO = require('../../infra/database/repositories/categoryTaskRepository');
const emailService = require("./emailServices");

class ProjectServices{
    async preparePageData(projectId){
        if(!projectId){
            const error = new Error("Projeto não especificado");
            error.statusCode = 400;
            throw error;
        }

        // Adicionar a busca de Contagem de mensagens e contagem de atividades
        const [project, tasks, members, columns, categories] = await Promise.all([
            projectDAO.findById(projectId),
            taskDAO.findByProjectId(projectId),
            userProjectRoleDAO.findMemberByProjectId(projectId),
            boardColumnDAO.findByProjectId(projectId),
            categoryTaskDAO.findAllByProjectId(projectId)
        ])
        console.log('TAREFA☁️☁️☁️', tasks);
        
        const taskIds = tasks.map(task => task.id);

        const allSubTasks = await subTaskDAO.findAllByTaskIds(taskIds);

        const enrichedTasks  = this._enrichTasksWithProgress(tasks, allSubTasks);
        
        const shapedColumns = await this._shapeTasksByColumns(columns, enrichedTasks);
        
        const pageData = {
            project: {
                id: project.id,
                title: project.titulo,
            },
            members: members, // O DAO já deve retornar apenas os dados necessários
            columns: shapedColumns,
            categories: categories
            // unreadCounts: {
            //     chatMessages: unreadMessagesCount,
            //     activityNotifications: unreadActivitiesCount
            // }
        }

        return pageData
    }
    
    _shapeTasksByColumns(columns, tasks){
        const tasksByColumnId = tasks.reduce((acc, task) => {
            const columnId = task.coluna_id;
            if(!acc[columnId]){
                acc[columnId] = []
            }
            acc[columnId].push(task);
            return acc;
        }, {}); // { 10: [tarefaA, tarefaC], 11: [tarefaB] }

        const shapedColumns = columns.map(column => {
            const tasksForColumn = tasksByColumnId[column.id] ?? [];
            
            return {
                id: column.id,
                title: column.nome,
                order: column.ordem,
                tasks: tasksForColumn
            };
        });

        return shapedColumns;
    }

    _createResponseContract(){
        /** 
         * {
               "project": {
                   "id": project.id
                   "titulo": project.titulo
                   "owner": project.criador_id      
                },
              
               "members": [
                  {"id": member.id, "name": member.name, "avatarUrl": member.foto_perfil}    
                {"id": member.id, "name": member.name, "avatarUrl": member.foto_perfil}    
                ],
         
                "colums": [
                 {
                    "id": colum.id,
                    "title": colum.name,
                    "order": colum.order,
                  
                    "tasks": [
                        {
                        "id": task.id,
                        "title": task.titulo,
                        "tags": ["UX/UI", "Frontend"], 
                        "progress": 20, xxxxxxxxxxxxxxxxx
                        "assignedMembers": [ // Apenas o suficiente para os avatares no card
                            { "id": member.id, "avatarUrl": "/path/to/ana.png" }, xxxxxxxxx
                            { "id": member.id, "avatarUrl": "/path/to/carlos.png" } xxxxxxxxxx
                        ],
                        "counts": { // Contagens importantes, mas sem os dados completos
                            "comments": comments.quantity,
                            "attachments": 2
                        }
                        },
                        // ... outras tarefas
                    ]
         *       ] 
         *          
         * }
         * 
         */
    }

    _enrichTasksWithProgress(tasks, allSubTasks) {
        // Passo A: O seu mapa de subtarefas já estava correto.
        const subTasksByTaskId = allSubTasks.reduce((acc, subTask) => {
            // Usamos .toJSON() para garantir que estamos a lidar com objetos simples
            const plainSubTask = subTask.get({ plain: true });
            const taskId = plainSubTask.tarefa_id;
            if (!acc[taskId]) {
                acc[taskId] = [];
            }
            acc[taskId].push(plainSubTask);
            return acc;
        }, {});

        // Passo B: Percorre cada tarefa para adicionar o progresso e as subtarefas
        return tasks.map(task => {
            const tasksSubTasks = subTasksByTaskId[task.id] || [];
            const progressPercentage = this._calcPercentage(tasksSubTasks);

            return {
                ...task.get({ plain: true }), // Garante que estamos a lidar com um objeto simples
                progress: progressPercentage,
                subTasks: tasksSubTasks // <<< CORREÇÃO 1: Adiciona as subtarefas ao objeto
            };
        });
    }

    _calcPercentage(subTasks) {
        if (!subTasks || subTasks.length === 0) {
            return 0;
        }

        const totalDeSubtarefas = subTasks.length;

        // Usar 'filter' é uma forma mais limpa de contar os itens concluídos
        const tarefasConcluidas = subTasks.filter(subTask => subTask.status_id === 1).length; // <<< CORREÇÃO 2

        const porcentagem = (tarefasConcluidas / totalDeSubtarefas) * 100;

        return Math.round(porcentagem);
    }

    async prepareSprintViewData(projectId) {
        if (!projectId) {
            const error = new Error("Projeto não especificado");
            error.statusCode = 400;
            throw error;
        }

        const [project, tasks, members, sprints] = await Promise.all([
            projectDAO.findById(projectId),
            taskDAO.findByProjectId(projectId), // Garanta que este método retorna o sprint_id
            userProjectRoleDAO.findMemberByProjectId(projectId),
            sprintDAO.findAllByProjectId(projectId) // Novo método necessário no SprintDAO
        ]);

        if (!project) {
            const error = new Error("Projeto não encontrado");
            error.statusCode = 404;
            throw error;
        }

        const taskIds = tasks.map(task => task.id);
        const allSubTasks = await subTaskDAO.findAllByTaskIds(taskIds);

        const enrichedTasks = this._enrichTasksWithProgress(tasks, allSubTasks);
        
        const { shapedSprints, backlogTasks } = this._shapeTasksBySprint(sprints, enrichedTasks);

        const sprintViewData = {
            project: {
                id: project.id,
                title: project.titulo,
            },
            members: members,
            sprints: shapedSprints,
            backlogTasks: backlogTasks
        };

        return sprintViewData;
    }

 
    _shapeTasksBySprint(sprints, tasks) {
        const tasksBySprintId = {};
        const backlogTasks = [];

        // Primeiro, agrupa todas as tarefas pelo sprint_id
        for (const task of tasks) {
            const sprintId = task.sprint_id;
            if (sprintId === null || sprintId === undefined) {
                backlogTasks.push(task); // Tarefas sem sprint vão para o backlog
            } else {
                if (!tasksBySprintId[sprintId]) {
                    tasksBySprintId[sprintId] = [];
                }
                tasksBySprintId[sprintId].push(task);
            }
        }

        // Depois, formata o array de sprints, adicionando as tarefas correspondentes
        const shapedSprints = sprints.map(sprint => ({
            id: sprint.id,
            sprintNumber: sprint.sprint_number,
            startDate: sprint.start_date,
            endDate: sprint.end_date,
            tasks: tasksBySprintId[sprint.id] || [] // Pega nas tarefas do mapa ou retorna [] se não houver
        }));

        return { shapedSprints, backlogTasks };
    }

    async create({titulo, dataTermino, categoria}, userId){
        if(!userId){
            throw new Error("ID do usuário não fornecido");
        }
        
        const t = await sequelize.transaction();


        console.log(titulo, dataTermino, categoria);
        
        try{
            const newProject = await projectDAO.create({
                "titulo": titulo, 
                "categoria_id" : categoria,
                "criador_id": userId,
                "data_termino": dataTermino
            }, {transaction: t});


            await userProjectRoleDAO.create({
                "usuario_id": userId,
                "projeto_id": newProject.id,
                "role": "Criador" 
            }, { transaction: t });

            const defaultColums = [
                {
                    nome: 'A Fazer',
                    ordem: 1,
                    projeto_id: newProject.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    nome: 'Fazendo',
                    ordem: 2,
                    projeto_id: newProject.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    nome: 'Concluído',
                    ordem: 3,
                    projeto_id: newProject.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]

            const defaultCategories = [      
                {
                    nome: 'Geral',
                    projeto_id: newProject.id,
                },
                {
                    nome: 'Pesquisa',
                    projeto_id: newProject.id,
                },
            ]

            await boardColumnDAO.createBulk(defaultColums, { transaction: t });
            await categoryDAO.createBulk(defaultCategories, { transaction: t })

            await t.commit();



            return newProject.get({plain: true});
        }catch(error){
            await t.rollback();

            console.error("Falha ao criar projeto", error);
            throw new Error("Não foi possível criar o projeto. A operação foi revertida.");
        }
    }

    async addMember(projectId, userIdToAdd, currentUserId, role ){
        let t = null;
        
        try{
            const t = await sequelize.transaction();

            // O usuário atual tem permissão de adicionar novos membros? 
            const currentUserRole = await userProjectRoleDAO.findByUserAndProject(currentUserId, projectId);

            if (!currentUserRole || !['Criador', 'Administrador'].includes(currentUserRole.role)) {
                throw new Error("Acesso negado: você não tem permissão para adicionar membros a este projeto.");
            }

            //O projeto passado existe?
            const project = await projectDAO.findById(projectId);

            if(!project){
                throw new Error("O projeto informado não existe.");
            }

            // O usuário a ser adicionado já é membro do projeto?
            const existingAssociation = await userProjectRoleDAO.findByUserAndProject(userIdToAdd, projectId);

            if (existingAssociation) {
                throw new Error("Este usuário já é membro do projeto.");
            }
            
            const newMember = await userProjectRoleDAO.create({
                usuario_id: userIdToAdd,
                projeto_id: projectId,
                role: role || "Membro"
            }, { transaction: t });

            await t.commit();

            try {
                await notificationDAO.create({
                    userId: userIdToAdd, 
                    type: 'convite',
                    message: `${currentUserId.nome} te convidou para o Projeto ${project.titulo} `,
                    metadata: {
                        requesterId: currentUserId,
                        projectId: projectId,
                        role: role
                    }
                });
            } catch (notificationError) {
                // Logamos o erro, mas não impedimos o sucesso da amizade.
                // Numa aplicação real, você poderia usar uma fila para garantir o envio.
                console.error("Falha ao criar notificação de convite para projeto:", notificationError);
            }

            return newMember.get({plain: true});
        }catch(error){
            if(t){
                await t.rollback();
            }
            
            // Relança o erro para o controller tratar
            if (error.statusCode) {
                throw error;
            }
            console.error("Falha ao adicionar membro:", error);
            const serverError = new Error("Não foi possível adicionar o membro ao projeto.");
            serverError.statusCode = 500;
            throw serverError;
        };
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

        // console.log("emails para convidar", emailsToInvite);

        // 5. AÇÃO DO BANCO: Cria apenas os convites válidos
        if(emailsToInvite.length > 0){
            const invitationsData = emailsToInvite.map(email => ({
                project_id: projectId,
                inviter_id: inviterId,
                invitee_email: email,
                role_to_assign: role || "Membro",
                status: "not confirmed"
            }));

            const newInvitations = await projectInvitationsDAO.createBulk(invitationsData);
            
            results.invitationsSent = newInvitations.map( inv => inv.invitee_email);
                        
            const project = await projectDAO.findById(projectId);
            

            // 6. ENVIO DE E-MAILS: Dispara os e-mails (pode ser em segundo plano)
            for (const invitation of newInvitations) {
                try{

                    const payload = {
                        invitationId: invitation.id
                    }

                    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d"}); 

                    const inviteLink = `localhost:3333/invites/accept?token=${token}`;
                    // const inviteLink = `https://kronosapp.com.br/invites/accept?token=${token}`;

                    const emailData = {
                        inviterName: inviter.nome,
                        projectName: project.titulo,
                        inviteLink: inviteLink
                    }
                    
                    await emailService.sendProjectInvitation(invitation.invitee_email, emailData);
                    await projectInvitationsDAO.updateStatus(invitation.id, "pending");
                    console.log(`✅ E-mail para ${invitation.invitee_email} enviado. Status: pendente.`);

                }catch(error){
                    console.error(`❌ Falha ao processar convite ${invitation.id} para ${invitation.invitee_email}. Analisando o erro...`);

                    if (error.errorType === 'permanent') {
                        // Marcamos o convite como "falhou" para que o nosso sistema saiba que não deve tentar novamente.
                        await projectInvitationsDAO.updateStatus(invitation.id, "failed");
                        console.log(`- Causa: Falha permanente (${error.message}). Status atualizado para 'failed'.`);

                    } else {
                        console.log(`- Causa: Falha temporária (${error.message}). O convite permanece 'não confirmado' para retentativa.`);
                    }
                }
            }
        }
    }

    async listProjectsForUser(userId){
        if(!userId){
            const error = new Error("Usuário não especificado");
            error.statusCode = 400;
            throw error;
        }

        const projects = await userProjectRoleDAO.findProjectForUser(userId);

        return projects;
    }
}

module.exports = new ProjectServices();