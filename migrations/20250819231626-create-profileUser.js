'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perfil_publico', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        references: {
          model: "usuario",
          key: "id"
        },
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
      },
      bio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      foto_perfil: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instituicao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cargo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      github: {
        type: Sequelize.STRING,
        allowNull: true
      },
      linkedin: {
        type: Sequelize.STRING,
        allowNull: true
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('perfil_publico');
  }
};
