const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');


const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
       type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    data_nascimento: {
           type: DataTypes.DATE,
        allowNull: true,
    },
    genero: {
        type: DataTypes.ENUM('masculino','feminino','outro'),
        allowNull: true
    },
    foto_perfil: {
        type: DataTypes.TEXT,
        allowNull: true
    }, 
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',   
    updatedAt: 'atualizado_em'

});

module.exports = User;