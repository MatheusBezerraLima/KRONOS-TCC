'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * O método 'up' é executado quando você roda o seeder.
   * Ele vai inserir os dados na sua tabela.
   */
  async up (queryInterface, Sequelize) {
    
    // IMPORTANTE: Este seeder assume que já existe um projeto com id = 1.
    // Se o seu projeto tiver outro ID, altere o valor de 'project_id' abaixo.
    const projectId = 1;

    await queryInterface.bulkInsert('coluna_board', [
      {
        nome: 'A Fazer',
        ordem: 1,
        project_id: projectId,
        // O Sequelize espera que estas colunas existam, adicione-as se for o caso
        // Se a sua migration não criou 'createdAt' e 'updatedAt', pode remover estas duas linhas.
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Fazendo',
        ordem: 2,
        project_id: projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'Concluído',
        ordem: 3,
        project_id: projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },
  
  async down (queryInterface, Sequelize) {
    // Apaga todas as colunas que pertencem ao projeto com id = 1
    await queryInterface.bulkDelete('coluna_board', { project_id: 1 }, {});
  }
};