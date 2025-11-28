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
    data_termino:{
        type: DataTypes.DATE,
        allowNull: true
    },
    sprint_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "sprint", key: "id"}
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: true,
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
    coluna_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "coluna_board",
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
        defaultValue: "Media"    
    },
    criador_id: {
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