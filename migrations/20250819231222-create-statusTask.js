'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('status_tarefa', {
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
      cor_fundo: {
          type: Sequelize.STRING,
          defaultValue: 'rgba(64, 64, 64, 0.1)',
      },
      cor_texto: {
          type: Sequelize.STRING,
          defaultValue: '#404040',
      } 
      });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('status_tarefa');
  }
};
