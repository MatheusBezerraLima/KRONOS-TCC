const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Project = sequelize.define("Project", {
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    criado_por : {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuario",
        key: "id"
      }
    },
    data_termino: {
      type: DataTypes.DATE,
      allowNull: true 
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'projeto',
    timestamps: false  
});

module.exports  = Project;