const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const ChatProjectMessage = sequelize.define("ChatProjectMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projeto",
            key: "id"
        }
    },
    conteudo: {
        type: DataTypes.TEXT, 
        allowNull: false,
        validate: {
            notEmpty: true 
        }
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    data_envio: {
        type:  DataTypes.DATE,
        defaultValue: DataTypes.NOW 
    }    
}, {
    tableName: "mensagem_chat_projeto",
    timestamps: false
});

module.exports = ChatProjectMessage;