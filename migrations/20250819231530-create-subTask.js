'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subtarefa', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tarefa_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tarefa",
          key: "id"
        }
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subtarefa');
  }
};
