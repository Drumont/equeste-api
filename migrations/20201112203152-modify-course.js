'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Courses', 'level', {type: Sequelize.STRING})
    await queryInterface.removeColumn('Courses', 'description')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Courses', 'level' )
    await queryInterface.addColumn('Courses', 'description', {type: Sequelize.STRING})
  }
};
