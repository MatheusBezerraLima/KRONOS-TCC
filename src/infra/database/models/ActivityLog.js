const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const ActivityLog = sequelize.define("ActivityLog", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projeto",
            key: "id"
        }
    },
    tarefa_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tarefa",
            key: "id"
        }
    },
    acao: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    descricao: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.NOW
    }, 
    data: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "log_atividade",
    timestamps: false
});

module.exports = ActivityLog;