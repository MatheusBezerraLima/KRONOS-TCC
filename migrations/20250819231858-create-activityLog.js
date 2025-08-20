'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('log_atividade', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id"
        }
      },
      projeto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "projeto",
          key: "id"
        }
      },
      tarefa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tarefa",
          key: "id"
        }
      },
      acao: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.NOW
      },
      data: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('log_atividade');
  }
};
