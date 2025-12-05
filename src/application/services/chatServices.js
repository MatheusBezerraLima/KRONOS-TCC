const userDAO = require('../../infra/database/repositories/userRepository');
const chatDAO = require('../../infra/database/repositories/chatRepository');

class chatService{
    async createMessage(projectId, userId, content){
        if (!content || !content.trim()) {
             const error = new Error("A mensagem nao pode estar vazia");
            error.statusCode = 400;
            throw error;
        }

        if (!projectId) {
            const error = new Error("Id do projeto é obrigatório");
            error.statusCode = 400;
            throw error;
        }

        const currentUser = await userDAO.findById(userId);
        
        if(!currentUser){
            const error = new Error("Usuário não encontrado no banco de dados");
            error.statusCode = 400;
            throw error;
        }

        const newMessage = await chatDAO.create({
            projeto_id: projectId,
            usuario_id: userId,
            conteudo: content,
            data_envio: new Date()
        });

        if(!newMessage){
            const error = new Error("Tarefa não foi criada");
            error.statusCode = 400;
            throw error;
        }

        return newMessage;
    }

    async listByProject(projectId){
        if (!projectId) {
            const error = new Error("Id do projeto é obrigatório");
            error.statusCode = 400;
            throw error;
        }

        const messages = await chatDAO.listByProject(projectId);

        if(!messages){
            const error = new Error("Nnehum retorno do DAO");
            error.statusCode = 400;
            throw error;
        }

        if(messages.lengh <= 0){
            return [];
        }

        return messages;
    }

}

module.exports = new chatService();