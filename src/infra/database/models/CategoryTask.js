const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const CategoryTask = sequelize.define("CategoryTask", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "categoria_tarefa",
    timestamps: false
});

module.exports = CategoryTask;