const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const StatusTask = sequelize.define("StatusTask", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usuario_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id"
        }
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "projeto",
            key: "id"
        },
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: "status_tarefa",
    timestamps: false
})

module.exports = StatusTask;