const { UserProjectRole, User, ProfileUser} = require("../models/index");

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