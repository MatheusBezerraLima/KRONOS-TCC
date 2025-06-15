const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const { defaultValueSchemable } = require("sequelize/lib/utils");

const PrivateMessage = sequelize.define("PrivateMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "chat_privado",
            key: "id"
        }
    },
    rementente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    mensagem: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "mensagem_privada",
    timestamps: false
});

module.exports = PrivateMessage;