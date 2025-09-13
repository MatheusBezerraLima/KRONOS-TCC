const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const UserProjectRole = sequelize.define("UserProjectRole", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "projeto",
            key: "id"
        }
    },
    role: {
        type: DataTypes.ENUM("Criador", "Administrador", "Membro"),
        allowNull: false
    }
}, {
    tableName: "usuario_projeto_papel",
    timestamps: false
});

module.exports = UserProjectRole;