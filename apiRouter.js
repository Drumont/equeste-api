// Imports
const express = require('express');
const UsersController = require('./Routes/UsersController');


// Routes
exports.router = (function () {
    const apiRouter = express.Router();

    // Users routes

    // Register routes
    apiRouter.route('/users/register/').post(UsersController.register);

    // Login routes
    apiRouter.route('/users/login/').post(UsersController.login);

    // Get user profile
    apiRouter.route('/users/me').get(UsersController.getUserProfile);

    // Update account informations
    apiRouter.route('/users/me/update').put(UsersController.updateAccount);

    // Update user password
    apiRouter.route('/users/update-password').put(UsersController.updateUserPassword);

    // Search user by email
    apiRouter.route('/users/search/user-by-email').get(UsersController.searchUserByEmail);

    return apiRouter;
})();

// Responses convention
exports.success = function (result) {
    return {
        status : 'success',
        result: result
    }
}

exports.error = function (message) {
    return {
        status : 'error',
        message: message
    }
}
