const userDAO = require('../../infra/database/repositories/userRepository'); 
const friendshipDAO = require('../../infra/database/repositories/friendshipRepository');
const notificationDAO = require('../../infra/database/repositories/notificationRepository');

class FriendshipService{
    async sendFriendRequest(addressee_id, requester_id){
        if(!addressee_id || !requester_id){
            const error = new Error("Requerente ou destinatário não especificados");
            error.statusCode = 400;
            throw error;
        }

        if (addressee_id === requester_id) {
            const error = new Error("Não pode adicionar-se a si mesmo como amigo.");
            error.statusCode = 400;
            throw error;
        }

        const [requesterUser, addresseeUser] = await Promise.all([
            userDAO.findById(requester_id),
            userDAO.findById(addressee_id)
        ]);

        if(!requesterUser || !addresseeUser){
            const error = new Error("Requerente ou destinatário não encontrados no banco");
            error.statusCode = 400;
            throw error;
        }

        const status = await friendshipDAO.findFriendshipStatus(requester_id, addressee_id);

        if (status !== 'none') {
            let message = "Não foi possível enviar o pedido.";
            if (status === 'friends') {
                message = "Vocês já são amigos.";
            } else if (status === 'pending_sent') {
                message = "Você já enviou um pedido de amizade para este usuário.";
            } else if (status === 'pending_received') {
                message = "Este usuário já lhe enviou um pedido. Verifique os seus pedidos recebidos.";
            }
            const error = new Error(message);
            error.statusCode = 409; // Conflict (Conflito)
            throw error;
        }

        const newFriendship = await friendshipDAO.createFriendRequest(requester_id, addressee_id)
        
        if(!newFriendship){
            const error = new Error("Não foi possivel criar o a solicitação de amizade");
            error.statusCode = 400;
            throw error;
        }

        // // Criar notificação para quem recebeu
        //  try {
        //     await notificationDAO.create({
        //         userId: addressee_id, 
        //         type: 'amizade',
        //         message: `${requesterUser.nome} enviou-lhe um pedido de amizade.`,
        //         metadata: {
        //             friendshipId: newFriendship.id,
        //             requesterId: requester_id
        //         }
        //     });
        // } catch (notificationError) {
        //     console.error("Falha ao criar notificação de amizade:", notificationError);
        // }

        return newFriendship;
    }

    async respondToRequest(currentUserId, otherUserId, newStatus){
        if(!currentUserId){
            const error = new Error("Necessário realizar login para responder a solicitação");
            error.statusCode = 400;
            throw error;
        }

        if(!otherUserId){
            const error = new Error("Usuário requerente da solicitação não identificado");
            error.statusCode = 400;
            throw error;
        }

        if(!newStatus || newStatus === "pending"){
            const error = new Error("Necessário que a solicitação seja negada ou aceita");
            error.statusCode = 400;
            throw error;
        }

        console.log("🟩Enviada por:", otherUserId, "Recebida por:",currentUserId

        );
        
        const [currentUser, otherUser, friendshipStatus] = await Promise.all([
            userDAO.findById(currentUserId),
            userDAO.findById(otherUserId),
            friendshipDAO.findFriendshipStatus(currentUserId, otherUserId),
        ]);

         if(!currentUser || !otherUser){
            const error = new Error("Usuário atual ou requerente da solicitação não encontrados no banco");
            error.statusCode = 400;
            throw error;
        }

        if(friendshipStatus !== 'pending_received'){
            let message = "A solicitação especificada não foi identificada ou já foi respondida.";
            if (friendshipStatus === 'friends') message = "Vocês já são amigos.";
            if (friendshipStatus === 'none') message = "Não existe um pedido de amizade deste usuário.";
            
            const error = new Error(message);
            error.statusCode = 404;
            throw error;
        }

        const updatedRequest = await friendshipDAO.updateStatusByUsers(currentUserId, otherUserId, newStatus);

        if (updatedRequest === 0) {
             const error = new Error("Não foi possível atualizar a solicitação.");
             error.statusCode = 500;
             throw error;
        }

        // Notificação caso tenha aceitado 
        if(newStatus === "accepted"){
            // Criar notificação para quem recebeu
            try {
                await notificationDAO.create({
                    userId: otherUserId, 
                    type: 'amizade',
                    message: `${currentUser.nome} aceitou o seu pedido de amizade!`,
                    metadata: {
                        friendshipId: newFriendship.id,
                        requesterId: otherUserId
                    }
                });
            } catch (notificationError) {
                console.error("Falha ao criar notificação de amizade:", notificationError);
            }
        }

        return { message: `Solicitação ${newStatus === 'accepted' ? 'aceita' : 'rejeitada'} com sucesso.` };
    }

    async listSentRequests(currentUserId){
        if(!currentUserId){
            const error = new Error("Necessário realizar login para responder a solicitação");
            error.statusCode = 400;
            throw error;
        }

        const currentUser = await userDAO.findById(currentUserId);

         if(!currentUser){
            const error = new Error("Usuário não encontrado no banco de dados");
            error.statusCode = 400;
            throw error;
        }

        const listSentRequests = await friendshipDAO.listSentRequests(currentUserId);

        if(!listSentRequests || listSentRequests.length === 0){
            const error = new Error("Não foi possivel buscar a lista de solicitações de amizade enviadas");
            error.statusCode = 400;
            throw error;
        }

        return listSentRequests;

    }

    async listReceivedRequests(currentUserId){
        if(!currentUserId){
            const error = new Error("Necessário realizar login para responder a solicitação");
            error.statusCode = 400;
            throw error;
        }
    
        const currentUser = await userDAO.findById(currentUserId);
    
         if(!currentUser){
            const error = new Error("Usuário não encontrado no banco de dados");
            error.statusCode = 400;
            throw error;
        }
    
        const listReceivedRequests = await friendshipDAO.listReceivedRequests(currentUserId);
    
        if(!listReceivedRequests){
            const error = new Error("Não foi possivel buscar a lista de solicitações de amizade enviadas");
            error.statusCode = 400;
            throw error;
        }

        if( listReceivedRequests.length === 0){
            return [];
        }
    
        return listReceivedRequests;
    
    }

    async findAllFriends(currentUserId){
        if(!currentUserId){
            const error = new Error("Necessário realizar login para responder a solicitação");
            error.statusCode = 400;
            throw error;
        }
    
        const currentUser = await userDAO.findById(currentUserId);
    
         if(!currentUser){
            const error = new Error("Usuário não encontrado no banco de dados");
            error.statusCode = 400;
            throw error;
        }
    
        const listFriends = await friendshipDAO.findAllFriends(currentUserId);
    
        if(!listFriends || listFriends.length === 0){
            const error = new Error("Não foi possivel buscar a lista de solicitações de amizade enviadas");
            error.statusCode = 400;
            throw error;
        }
    
        return listFriends;
    
    }

    async deleteFriendship(currentUserId, otherUserId){
        if(!currentUserId){
            const error = new Error("Necessário realizar login para responder a solicitação");
            error.statusCode = 400;
            throw error;
        }

        if(!otherUserId){
            const error = new Error("Usuário requerente da solicitação não identificado");
            error.statusCode = 400;
            throw error;
        }

        const [currentUser, otherUser, friendshipStatus] = await Promise.all([
            userDAO.findById(currentUserId),
            userDAO.findById(otherUserId),
            friendshipDAO.findFriendshipStatus(otherUserId, currentUserId),
        ]);

         if(!currentUser || !otherUser){
            const error = new Error("Usuário atual ou requerente da solicitação não encontrados no banco");
            error.statusCode = 400;
            throw error;
        }

        if(friendshipStatus == 'none'){
            let message = "Não existe um pedido de amizade deste usuário.";
            const error = new Error(message);
            error.statusCode = 404;
            throw error;
        }

        const deletedRequest = await friendshipDAO.deleteByUsers(currentUserId, otherUserId);

        if (deletedRequest === 0) {
             const error = new Error("Não foi possível atualizar a solicitação.");
             error.statusCode = 500;
             throw error;
        }

        return { message: `Amizade entre ${currentUser.nome} e ${otherUser.nome} foi deletada`};
    }

}

module.exports = new FriendshipService();