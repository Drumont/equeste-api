'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    //await queryInterface.bulkInsert('Account', [])
    return queryInterface.bulkInsert('Accounts', [{
      firstname: 'Root',
      lastname: 'Root',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
        .then( function (account) {
          return queryInterface.bulkInsert('Users', [{
            email: 'root@root.com',
            permission_id: 1,
            password: 'root',
            account_id: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', {email:'root@root.com'}, {});
  }
};
