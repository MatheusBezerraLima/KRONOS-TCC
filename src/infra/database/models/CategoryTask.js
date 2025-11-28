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
    },
    usuario_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id"
        }
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'projeto',
            key: "id"
        }
    },
    cor_fundo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#3B82F6"
    },
    cor_texto: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#3B82F6"
      }
}, {
    tableName: "categoria_tarefa",
    timestamps: false
});

module.exports = CategoryTask;