'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tarefa', 'sprint_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'sprint',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tarefa', 'sprint_id');
  }
};

