'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workDetailData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      workDetailId: {
        type: Sequelize.UUID,
      },
      videoUrl: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      media: {
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workDetailData');
  },
};
