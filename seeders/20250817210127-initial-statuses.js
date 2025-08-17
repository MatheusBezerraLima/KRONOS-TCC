'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('status_tarefa', [
     {
        nome: 'A Fazer',
        ordem: 1,
      },
      {
        nome: 'Em Andamento',
        ordem: 2,
      },
      {
        nome: 'Concluída',
        ordem: 3,
      }
   ], {});
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.bulkDelete('status_tarefa', null, {});
  }
};
