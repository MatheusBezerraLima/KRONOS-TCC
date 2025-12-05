const { ChatProjectMessage, User, ProfileUser  } = require('../models/index');

class ChatDAO{ 
    async create(messageData){
        try{
            const newMessage = await ChatProjectMessage.create(messageData);

            const fullMessage = await ChatProjectMessage.findByPk(newMessage.id, {
                include: [
                    {
                        model: User,
                        as: 'usuario', 
                        attributes: ['id', 'nome'], 
                        include: [
                            {
                                model: ProfileUser,
                                as: 'profile', 
                                attributes: ['foto_perfil'] 
                            }
                        ]
                    }
                ]
            });

 
            const result = fullMessage.get({ plain: true });

            if (result.usuario && result.usuario.profile) {
                result.usuario.foto_perfil = result.usuario.profile.foto_perfil;
            } else {
                result.usuario.foto_perfil = null; // Caso não tenha perfil
            }

            return result;
        }catch(error){
            console.error("Erro ao criar nova mensagem:", error);
            throw new Error(`Não foi possível criar nova mensagem: ${error.message}`);
        }
    }

    async listByProject(projectId){
        try{
            const messages = await ChatProjectMessage.findAll({
                where: { 
                    projeto_id: projectId 
                },
                // ORDENAÇÃO: 'ASC' para ascendente (Antigas -> Novas)
                order: [
                    ['data_envio', 'ASC'] 
                ],
                include: [
                    {
                        model: User,
                        as: 'usuario', 
                        attributes: ['id', 'nome'], 
                        include: [
                            {
                                model: ProfileUser,
                                as: 'profile', 
                                attributes: ['foto_perfil'] 
                            }
                        ]
                    }
                ]
            });

            return messages;
        }catch(error){
            console.error(`Erro ao lsitar mensagens do projeto ${projectId}:`, error);
            throw new Error(`Não foi possível listar mensagens do projeto ${projectId}: ${error.message}`);
        }
    }
    
}

module.exports = new ChatDAO();