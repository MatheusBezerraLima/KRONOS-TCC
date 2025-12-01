'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona a coluna 'projeto_id' na tabela 'categoria_tarefa'
    await queryInterface.addColumn('categoria_tarefa', 'projeto_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Importante ser true se já houver dados no banco
      references: {
        model: 'projeto', // Nome EXATO da tabela de projetos no banco
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Se deletar o projeto, deleta as categorias dele (ajuste se preferir SET NULL)
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove a coluna caso desfaça a migration
    await queryInterface.removeColumn('categoria_tarefa', 'projeto_id');
  }
};