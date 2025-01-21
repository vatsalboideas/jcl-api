'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('careerForms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      careerId: {
        type: Sequelize.UUID,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      contactNumber: {
        type: Sequelize.STRING,
      },
      portfolioLink: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.STRING,
      },
      emailId: {
        type: Sequelize.STRING,
      },
      resume: {
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
    await queryInterface.dropTable('careerForms');
  },
};
