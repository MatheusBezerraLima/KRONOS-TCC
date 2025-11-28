'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tarefa', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projeto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "projeto",
          key: "id"
        }
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      data_termino: {
        type: Sequelize.DATE,
        allowNull: true
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "status_tarefa",
          key: "id"
        }
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "categoria_tarefa",
          key: "id"
        }
      },
      coluna_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "coluna_board",
          key: "id"
        }
      },
      sprint_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sprint",
          key: "id"
        }
      },
      prioridade: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Media"
      },
      criador_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id"
        }
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tarefa');
  }
};
