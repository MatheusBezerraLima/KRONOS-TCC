const { UserProjectRole, User, ProfileUser, Project, CategoryTask, Task} = require("../models/index");

class UserProjectRoleDAO{
    async create(data,  options = {}){
        try{
            return await UserProjectRole.create(data, { transaction: options.transaction });
        }catch(error){
            console.error(`Erro no DAO criar relação do usuário ${data.usuario_id} com projeto ${data.projeto_id}:`, error);
            throw error;
        }
        
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

     async findProjectForUser(userId) {
        try {
            const userProjects = await UserProjectRole.findAll({
                where: {
                    usuario_id: userId
                },
                include: [{
                    model: Project,
                    // attributes: você pode selecionar só o que precisa do projeto aqui se quiser
                    include: [
                        {
                            model: CategoryTask,
                            as: 'categoryTask',
                        },
                        {
                            model: Task,
                            as: 'tasks', // Certifique-se que seu Project.hasMany(Task) usa esse alias (ou remova o 'as' se for padrão)
                            attributes: ['id', 'status_id'] // Trazemos apenas o necessário para calcular
                        }
                    ]
                }]
            });

            // Processamento dos dados para calcular o progresso
            const projectsWithProgress = userProjects.map(role => {
                // .get({ plain: true }) converte a instância do Sequelize em um objeto JSON puro
                const project = role.Project.get({ plain: true });

                const tasks = project.tasks || [];
                const totalTasks = tasks.length;
                console.log("🚀", tasks);
                
                // Filtra tarefas concluídas (Assumindo que status_id 3 = Concluído)
                // Se o seu ID de concluído for diferente, altere o número 3 abaixo.
                const completedTasks = tasks.filter(t => t.status_id === 3).length;

                // Cálculo da porcentagem (evita divisão por zero)
                const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                // Adiciona as novas propriedades ao objeto do projeto
                project.progress = progress;
                project.total_tasks = totalTasks;
                project.completed_tasks = completedTasks;

                // (Opcional) Remove o array de tasks para não enviar dados desnecessários pro front
                delete project.tasks; 

                return project;
            });

            return projectsWithProgress;

        } catch (error) {
            console.error(`Erro no DAO ao buscar projetos associados ao usuário: ${error.message}`);
            throw error;
        }
    }

    async findMemberEmailsByProjectId(projectId) {
        try{
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
        }catch(error){
            console.error(`Erro no DAO ao buscar e-mails de membros do projeto:`, error);
            throw error;
        }
        
    }

    async findMemberByProjectId(projectId){
        try{
             const memberships = await UserProjectRole.findAll({
                where: {
                    projeto_id: projectId // Encontra todas as ligações para este projeto
                },
                // A "magia" acontece aqui:
                include: [{
                    model: User, 
                    attributes: ['id', 'nome'] ,
                }],
                attributes: ['role']
            });
            
            if (memberships.length === 0) {
            return [];
        }

        // 2. Extrai os IDs de todos os usuários encontrados
        const userIds = memberships.map(m => m.User.id);
        console.log("User ids: ", userIds );
        
        // 3. Busca todos os perfis para esses usuários em uma única consulta separada
        const profiles = await ProfileUser.findAll({
            where: { usuario_id: userIds },
            attributes: ['usuario_id', 'foto_perfil']
        });
        console.log("Profiles: ", profiles );

        // 4. Mapeia os perfis para um acesso rápido (ex: { '1': 'url_da_foto.jpg' })
        const profileMap = profiles.reduce((map, profile) => {
            map[profile.usuario_id] = profile.foto_perfil;
            return map;
        }, {});

        console.log("profileMap: ", profileMap );

        // 5. Junta tudo no seu objeto final
        const members = memberships.map(membership => ({
            id: membership.User.id,
            nome: membership.User.nome,
            avatarUrl: profileMap[membership.User.id] || null, // Pega a foto do mapa
            funcaoNoProjeto: membership.role
        }));

            return members;
        }catch(error){
            console.error(`Erro no DAO (Role) ao buscar membros de um projeto ${error.message}`);
            throw error;
        }

    }
}

module.exports = new UserProjectRoleDAO();