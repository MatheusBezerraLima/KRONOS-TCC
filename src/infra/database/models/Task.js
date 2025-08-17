const { toDefaultValue } = require("sequelize/lib/utils");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "projeto",
            key: "id"
        }
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "status_tarefa",
            key: "id"
        }
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "categoria_tarefa",
            key: "id"
        }
    },
    prioridade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Média"    
    },
    criador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},  {
    tableName: "tarefa",
    timestamps: false
})

module.exports = Task;