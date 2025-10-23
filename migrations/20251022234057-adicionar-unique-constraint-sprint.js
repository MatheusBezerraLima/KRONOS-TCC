'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Adiciona uma restrição UNIQUE na combinação das colunas
   * 'projeto_id' e 'sprint_number' na tabela 'sprint'.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('sprint', {
      fields: ['projeto_id', 'sprint_number'], // As colunas que devem ser únicas juntas
      type: 'unique',
      name: 'unique_sprint_number_per_project' // Um nome descritivo para a constraint
    });
  },

  
  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('sprint', 'unique_sprint_number_per_project');
  }
};
