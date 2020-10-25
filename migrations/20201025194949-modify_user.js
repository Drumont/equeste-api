'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Users', 'phone',{ type: Sequelize.STRING })
    await queryInterface.removeColumn('Accounts', 'phone')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('Accounts', 'phone',{ type: Sequelize.STRING })
    await queryInterface.removeColumn('Users', 'phone')
  }
};
