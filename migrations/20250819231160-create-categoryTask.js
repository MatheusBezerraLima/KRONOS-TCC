'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categoria_tarefa', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      usuario_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id"
      },
      },
      projeto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'projeto',
            key: "id"
        }
      },
      cor_fundo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "#3B82F6"
      },
      cor_texto: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "#3B82F6"
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categoria_tarefa');
  }
};
