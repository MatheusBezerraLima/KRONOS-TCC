'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('convites_projeto', { // Nome da tabela
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projeto', // Nome da tabela de projetos
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Se um projeto for deletado, seus convites também serão.
      },
      inviter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario', // Nome da tabela de usuários
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Se o usuário que convidou for deletado, seus convites também serão.
      },
      invitee_email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('not confirmed' ,'pending', 'accepted', 'declined', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      role_to_assign: {
        type: Sequelize.ENUM("Membro", "Administrador"),
        allowNull: false,
        defaultValue: "Membro"
      },
      token: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true
      },
      expires_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('project_invitations');
  }
};