'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('categoria_tarefa', [
    {
      nome: "Pessoal"
    },
    {
      nome: "Trabalho"
    },
    {
      nome: "Estudo"
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categoria_tarefa', null, {})
  }
};
