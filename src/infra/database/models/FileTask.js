const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const FileTask = sequelize.define("FileTask", {
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
    nome_arquivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    data_upload: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "arquivo_tarefa",
    timestamps: false
});

module.exports = FileTask;