'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Migration para constraint COMPOSTA (usuário + nome)
  async up (queryInterface, Sequelize) {
      await queryInterface.addConstraint('status_tarefa', {
        fields: ['usuario_id', 'nome'], // A COMBINAÇÃO das duas colunas deve ser única
        type: 'unique',
        name: 'unique_status_name_per_user'
      });
  },
  async down (queryInterface, Sequelize) {
    // Remove a restrição caso precise desfazer (rollback) a migration
    await queryInterface.removeConstraint('status_tarefa', 'unique_status_name');
  }
};