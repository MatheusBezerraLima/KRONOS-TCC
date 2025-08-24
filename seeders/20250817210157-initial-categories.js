'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('categoria_tarefa', [
    {
      nome: "Pessoal",
      usuario_id: 1,
    },
    {
      nome: "Trabalho",
      usuario_id: 1,
    },
    {
      nome: "Estudo",
      usuario_id: 1,
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categoria_tarefa', null, {})
  }
};
