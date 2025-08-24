'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona a restrição UNIQUE na coluna 'nome' da tabela 'categoria_tarefa'
    await queryInterface.addConstraint('categoria_tarefa', {
      fields: ['usuario_id', 'nome'], // A coluna que deve ser única
      type: 'unique',
      name: 'unique_category_name_per_user' // Um nome para a restrição
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove a restrição caso precise desfazer (rollback) a migration
    await queryInterface.removeConstraint('categoria_tarefa', 'unique_category_name');
  }
};