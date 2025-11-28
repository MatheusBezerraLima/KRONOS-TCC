'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('status_tarefa', [
     {
        nome: 'Pendente',
        cor_fundo: 'rgba(64, 64, 64, 0.1)',
        cor_texto: '#404040'
      },
      {
        nome: 'Em Andamento',
        cor_fundo: 'rgba(52, 98, 191, 0.1)',
        cor_texto: '#3462BF'
      },
      {
        nome: 'Concluída',
        cor_fundo: 'rgba(17, 149, 0, 0.1)',
        cor_texto: '#119500'
      }
   ], {});
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.bulkDelete('status_tarefa', null, {});
  }
};
