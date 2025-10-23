'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * O método 'up' é executado quando você roda a migration.
   * Ele adiciona a nova coluna 'data_termino' à sua tabela 'tarefa'.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tarefa', 'data_termino', {
      type: Sequelize.DATE,
      allowNull: true // Permite que a data seja nula, pois é um campo opcional
    });
  },

  /**
   * O método 'down' é executado para reverter a migration.
   * Ele remove a coluna 'data_termino'.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tarefa', 'data_termino');
  }
};
