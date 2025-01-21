'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      workId: {
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING,
      },
      landscapeImage: {
        type: Sequelize.UUID,
      },
      verticalImage: {
        type: Sequelize.UUID,
      },
      squareImage: {
        type: Sequelize.UUID,
      },
      data: {
        type: Sequelize.STRING,
      },
      websiteLink: {
        type: Sequelize.STRING,
      },
      slug: {
        type: Sequelize.STRING,
      },
      detailsData: {
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
    await queryInterface.dropTable('workData');
  },
};
