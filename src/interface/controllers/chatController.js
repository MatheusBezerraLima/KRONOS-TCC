const chatService = require('../../application/services/chatServices');

class chatController{
    async createMessage(req, res){
        try{
           const { projectId } = req.params;
            const { content } = req.body;
            const userId = req.user.id; 

            console.log("Projeto", projectId);
            console.log("content", content);
            console.log("User", userId);
            

            const newMessage =  await chatService.createMessage(parseInt(projectId), parseInt(userId), content);

            res.status(201).json(newMessage)
        }catch(error){
            res.status(error.statusCode || 500).json({ message: error.message });
        }
        


    }

    async listByProject(req, res) {
        try {
            const { projectId } = req.params;

            const messages = await chatService.listByProject(parseInt(projectId))

            return res.status(200).json(messages);
        } catch (error) {
            console.error("Erro ao listar mensagens:", error);
            return res.status(500).json({ message: "Erro ao buscar chat." });
        }
    }
}

module.exports = new chatController();