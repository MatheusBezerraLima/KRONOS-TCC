const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const BoardColumn = sequelize.define("BoardColumn", {
    id:  {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type:  DataTypes.STRING,
        allowNull: false
    },
    ordem: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projeto",
            key: "id"
        }
    }
}, {
    tableName: "coluna_board",
    timestamps: false
});

module.exports = BoardColumn;