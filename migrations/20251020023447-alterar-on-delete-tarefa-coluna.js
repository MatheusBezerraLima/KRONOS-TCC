'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primeiro, removemos a constraint antiga para a podermos recriar
    // O nome da constraint pode variar, verifique no seu gestor de DB se este nome está correto
    await queryInterface.removeConstraint('tarefa', 'tarefa_ibfk_3'); // Nome pode variar!

    // Agora, adicionamos a nova constraint com a regra correta
    await queryInterface.addConstraint('tarefa', {
      fields: ['coluna_id'],
      type: 'foreign key',
      name: 'tarefa_coluna_id_fk', // Um novo nome para a constraint
      references: {
        table: 'coluna_board',
        field: 'id',
      },
      onDelete: 'SET NULL', // <<< A CORREÇÃO ESTÁ AQUI
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    // O 'down' reverte as alterações
    await queryInterface.removeConstraint('tarefa', 'tarefa_coluna_id_fk');
    
    // Recria a constraint original (pode precisar de ajustar se o nome era diferente)
    await queryInterface.addConstraint('tarefa', {
      fields: ['coluna_id'],
      type: 'foreign key',
      name: 'tarefa_ibfk_3',
      references: {
        table: 'coluna_board',
        field: 'id',
      },
      onDelete: 'CASCADE', // Reverte para a regra antiga
      onUpdate: 'CASCADE',
    });
  }
};
