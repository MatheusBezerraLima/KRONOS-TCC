const { Friendship, User, ProfileUser } = require('../models/index');
const { Op } = require('sequelize');

class FriendshipDAO {
    async createFriendRequest(requester_id, addressee_id){
        try{
            return await Friendship.create({
                requester_id: requester_id,
                addressee_id: addressee_id,
                status: "pending",
            });
        }catch(error){
            console.error(`Erro no DAO ao criar solicitação de amizade`, error)
            throw error;
        }
    }

    async updateStatusByUsers(currentUserId, otherUserId, newStatus) {
        try {
            const [affectedRows] = await Friendship.update(
                { status: newStatus }, 
                {
                    where: {
                        requester_id: otherUserId, 
                        addressee_id: currentUserId, 
                        status: 'pending'
                    } 
                }
            );
            return affectedRows;
        } catch (error) {
            console.error('Erro no DAO ao atualizar status da amizade:', error);
            throw error;
        }
    }

    async deleteByUsers(currentUserId, otherUserId) {
        try {
            return await Friendship.destroy({
                where: {
                    [Op.or]: [
                        { requester_id: currentUserId, addressee_id: otherUserId },
                        { requester_id: otherUserId, addressee_id: currentUserId }
                    ]
                }
            });
        } catch (error) {
            console.error('Erro no DAO ao apagar amizade:', error);
            throw error;
        }
    }

    async listReceivedRequests(currentUserId){
        try{
            return await Friendship.findAll({
                where: {
                    addressee_id: currentUserId,
                    status: "pending"
                },
                include: [{
                    model: User,
                    as: 'Requester',
                    attributes: ['id', 'nome'], 
                    include: [{
                        model: ProfileUser,
                        as: 'profile',
                        attributes: ['foto_perfil']
                    }]
                }]
            })
        }catch(error){
            console.error(`Erro no DAO ao listar  solicitação de amizade recebidas`, error)
            throw error;
        }
    }

    async listSentRequests(currentUserId){
        try{
            return await Friendship.findAll({
                where: {
                    requester_id: currentUserId,
                    status: "pending"
                },
                include: [{
                    model: User,
                    as: 'Addressee', 
                    attributes: ['id', 'nome'],
                    include: [{
                        model: ProfileUser,
                        as: 'profile',
                        attributes: ['foto_perfil']
                    }]
                }]
            })
        }catch(error){
            console.error(`Erro no DAO ao listar  solicitação de amizade enviadas`, error)
            throw error;
        }
    }

    async findAllFriends(currentUserId){
        try{
            return await Friendship.findAll({
                where: {
                    status: 'accepted',
                    [Op.or]: [
                        { requester_id: currentUserId },
                        { addressee_id: currentUserId }
                    ]
                },
                include: [{
                    model: User,
                    as: 'Requester',
                    attributes: ['id', 'nome'],
                    include: [{ 
                        model: ProfileUser, 
                        as: 'profile', 
                        attributes: ['foto_perfil'] 
                    }]
                },
                {
                    model: User,
                    as: 'Addressee',
                    attributes: ['id', 'nome'],
                    include: [{ 
                        model: ProfileUser,
                        as: 'profile',
                        attributes: ['foto_perfil']
                    }]
                }]
            })
        }catch(error){
            console.error(`Erro no DAO ao listar amizades`, error)
            throw error;
        }
    }

    async findFriendshipStatus(currentUserId, otherUserId){
        try {
            const friendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { requester_id: currentUserId, addressee_id: otherUserId },
                        { requester_id: otherUserId, addressee_id: currentUserId }
                    ]
                }
            });

            if (!friendship) {
                return 'none';
            }

            if (friendship.status === 'accepted') {
                return 'friends';
            }

            if (friendship.requester_id === currentUserId) {
                return 'pending_sent'; 
            } else {
                return 'pending_received'; 
            }

        } catch (error) {
            console.error('Erro no DAO ao buscar status de amizade:', error);
            throw error;
        }
    }
}

module.exports = new FriendshipDAO();