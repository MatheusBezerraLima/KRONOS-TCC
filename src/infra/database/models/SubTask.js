const { toDefaultValue } = require("sequelize/lib/utils");
const sequelize = require("../../../config/database");
const { DataTypes, DatabaseError } = require("sequelize");

const SubTask = sequelize.define("SubTask", {
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
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "subtarefa",
    timestamps: false
});

module.exports = SubTask;