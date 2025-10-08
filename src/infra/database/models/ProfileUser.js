const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");

const ProfileUser = sequelize.define("ProfileUser", {
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
    bio: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    foto_perfil: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    instituicao: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    github: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linkedin: {
        type: DataTypes.STRING,
        allowNull: true
    },
},{
    tableName: "perfil_publico",
    timestamps: true,
    createdAt: 'createdAt',   
    updatedAt: 'updatedAt'
});

module.exports  = ProfileUser;