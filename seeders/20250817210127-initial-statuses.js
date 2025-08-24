'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('status_tarefa', [
     {
        nome: 'Não iniciado',
        ordem: 1,
        usuario_id: 1,
      },
      {
        nome: 'Em Andamento',
        ordem: 2,
        usuario_id: 1,
      },
      {
        nome: 'Concluída',
        ordem: 3,
        usuario_id: 1,
      }
   ], {});
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.bulkDelete('status_tarefa', null, {});
  }
};
