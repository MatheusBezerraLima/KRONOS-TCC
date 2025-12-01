const friendshipService = require("../../application/services/friendshipService");


class FriendshipController {
    async sendFriendRequest(req, res){
        try{
            const { addressee_id } = req.body
            const requester_id = req.user.id;
;

            const requestSent = await friendshipService.sendFriendRequest(addressee_id, requester_id);

            res.status(201).json(requestSent)
        }catch(error){
            console.error("Erro no fluxo de enviar solicitação de amizade:", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }   
    }

    async respondToRequest(req, res){
        try{
            const { otherUserId } = req.params;
            const { newStatus } = req.body;
            const currentUserId = req.user.id;


            const updatedRequest = await friendshipService.respondToRequest(currentUserId, parseInt(otherUserId, 10), newStatus);

            res.status(200).json(updatedRequest);
        }catch(error){
            console.error("Erro no fluxo de atualizar o status da solicitação de amizade:", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    }

    async listSentRequests(req, res){
        try{
            const currentUserId = req.user.id;
    

            const listRequestsSent = await friendshipService.listSentRequests(currentUserId);
            
            res.status(200).json(listRequestsSent);
        }catch(error){
            console.error("Erro no fluxo de listar solicitações de amizade enviadas", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    } 

    async listReceivedRequests(req, res){
        try{
            const currentUserId = req.user.id;

            const listReceivedRequests = await friendshipService.listReceivedRequests(currentUserId);
            
            res.status(200).json(listReceivedRequests);
        }catch(error){
            console.error("Erro no fluxo de listar solicitações de amizade recebidas", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    } 

    async findAllFriends(req, res){
        try{
            const currentUserId = req.user.id;
            

            const listFriends = await friendshipService.findAllFriends(currentUserId);
            
            res.status(200).json(listFriends);
        }catch(error){
            console.error("Erro no fluxo de listar amizadeS", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    } 

    async deleteFriendship(req, res){
        try{
            const currentUserId = req.user.id;
            const { otherUserId } = req.params;

            const deletedRequest = await friendshipService.deleteFriendship(currentUserId, parseInt(otherUserId, 10));
            
            res.status(200).json(deletedRequest);
        }catch(error){
            console.error("Erro no fluxo de excluir amizade", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    }


}

module.exports = new FriendshipController();