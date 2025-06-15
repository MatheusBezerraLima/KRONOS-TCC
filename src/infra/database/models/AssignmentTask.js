const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const assignmentTask = sequelize.define("assignmentTask", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tarefa_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tarefa",
            key: "id"
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
    atribuicao_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    tableName: "atribuicao_tarefa",
    timestamps: false
});

module.exports = assignmentTask;