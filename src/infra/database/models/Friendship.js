const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Friendship = sequelize.define("Friendship", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    requester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        refenreces: {
            model: "usuario",
            key: "id"
        }
    },
    addressee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        refenreces: {
            model: "usuario",
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "declined", "blocked"),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    tableName: "Friendship",
    timestamps: true
});

module.exports = Friendship;