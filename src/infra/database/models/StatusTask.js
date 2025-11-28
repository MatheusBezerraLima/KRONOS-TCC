const { toDefaultValue } = require("sequelize/lib/utils");
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
    cor_fundo: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    cor_texto: {
        type: DataTypes.STRING,
        defaultValue: '',
    }
}, {
    tableName: "status_tarefa",
    timestamps: false
})

module.exports = StatusTask;