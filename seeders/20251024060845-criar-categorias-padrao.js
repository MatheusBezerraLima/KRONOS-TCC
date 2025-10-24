'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // O ID do usuário ao qual estas categorias padrão pertencerão.
    // Como você pediu, estamos a usar o ID 1.
    const defaultUserId = 1; 

    await queryInterface.bulkInsert('categoria_tarefa', [
      {
        nome: 'Design',
        usuario_id: defaultUserId
        // Nota: Não especificamos o 'id' aqui. Como a sua migration
        // usa 'autoIncrement: true', a base de dados irá atribuir
        // os IDs 1, 2, e 3 automaticamente (se a tabela estiver vazia).
      },
      {
        nome: 'Backend',
        usuario_id: defaultUserId
      },
      {
        nome: 'Frontend',
        usuario_id: defaultUserId
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // O 'down' apaga os dados que o 'up' inseriu
    await queryInterface.bulkDelete('categoria_tarefa', {
      nome: ['Design', 'Backend', 'Frontend']
    }, {});
  }
};