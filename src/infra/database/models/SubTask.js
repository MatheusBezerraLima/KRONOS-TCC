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
        allowNull: true,
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
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    taableName: "subtarefa",
    timestamps: false
});

module.exports = SubTask;