const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');


const Notificacao = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, 
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        refereces: {
            model: "usuario",
            key: "id"
        }
    },
    tipo: {
        type: DataTypes.ENUM,
        values: ['sistema', 'mensagem', 'convite', 'amizade', 'tarefa'],
        allowNull: false,
        defaultValue: 'sistema'
    },
    mensagem: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadados: {
        type: DataTypes.JSON, 
        allowNull: true,
        comment: "Guarda IDs relacionados (ex: { messageId: 1, projectId: 5 })"
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "notificacao",
    Timestamps: false
});

module.exports = Notificacao;