'use strict';
const bcrypt= require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("usuario", [
      {
            googleId: null,
            githubId: null,
            linkedinId: null,
            nome: "Matheus",
            email: "matheus@gmail.com",
            senha: await bcrypt.hash("123456", 10),
            role: "user",
            telefone: "11974746352",
            status: "Ativo",
            criado_em: new Date(),       
            atualizado_em: new Date()  
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("usuario_id", null, {});
  }
};
