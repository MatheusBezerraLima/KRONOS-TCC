const { Notification  } = require('../models/index');

class NotificationDAO {
    async create (userId, type, message, metadata){
        try{
            return await Notification.create({
                usuario_id: userId,
                tipo: type,
                mensagem: message,
                metadados: metadata,
                criado_em: new Date()
            });
        }catch(error){  
            console.error(`Erro no DAO criar notificação: ${error.message}`);
            throw error;
        }
    }

    async markAsRead(notificationId){
        try{
            return await Notification.update(
                { lida: true},
                {
                    where:{
                        id: notificationId
                    }
                }
            )
        }catch(error){
            console.error(`Erro no DAO atualizar stats de leitura da notificação: ${error.message}`);
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            return await Notification.update(
                { lida: true },
                {
                    where: { 
                        usuario_id: userId,
                        lida: false
                    }
                }
            );
        } catch (error) {
            console.error(`Erro no DAO ao marcar todas como lidas: ${error.message}`);
            throw error;
        }
    }

    async deleteNotification(notificationId){
        try{
            return await Notification.destroy({
                where: {
                    id: notificationId
                }
            });
        }catch(error){
            console.error(`Erro no DAO deletar notificação: ${error.message}`);
            throw error; 
        }
    }

    async findAllByUserId(userId) {
        try {
            return await Notification.findAll({
                where: {
                    usuario_id: userId
                },
                order: [['criado_em', 'DESC']]
            });
        } catch (error) {
            console.error(`Erro no DAO ao buscar notificações do usuário ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = new NotificationDAO();