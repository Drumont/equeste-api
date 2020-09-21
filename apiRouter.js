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

    // Update user profile
    apiRouter.route('/users/me/update').get(UsersController.getUserProfile);

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
