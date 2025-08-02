const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');


const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    githubId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    linkedinId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    nome: {
       type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'UQ_usuario_email', 
            msg: 'Este e-mail já está em uso.'
        },
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: 'user'
    },
    telefone: {                         
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("Ativo", "Inativo"),
        defaultValue: "Ativo"
    }
}, {
    tableName: 'usuario',
    timestamps: true,
    createdAt: 'criado_em',   
    updatedAt: 'atualizado_em'

});

module.exports = User;