const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');


const Notificacao = sequelize.define("Notificacao", {
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
    mensagem: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    data: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "notificacao",
    Timestamps: false
});

module.exports = Notificacao;