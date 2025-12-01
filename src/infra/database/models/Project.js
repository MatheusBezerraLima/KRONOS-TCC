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
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "categoria_tarefa",
          key: "id"
        }
    },
    criador_id : {
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
  }, {
    tableName: 'projeto',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports  = Project;