const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const PrivateChat = sequelize.define("PrivateChat", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    usuario2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    criado_em: {
        type:  DataTypes.DATE,
        defaultValue: DataTypes.NOW 
    }    
}, {
    tableName: "chat_privado",
    timestamps: false
});

module.exports = PrivateChat;