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
      projeto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "projeto",
          key: "id"
        }
      },
      ordem: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
       usuario_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id"
        }
    }});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('status_tarefa');
  }
};
