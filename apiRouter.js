// Imports
const express = require('express');
const usersController = require('./Routes/UsersController');
const horsesController =  require('./routes/HorsesController');
const coursesController = require('./routes/CoursesController');
const sessionController = require('./routes/SessionController');

// Routes
exports.router = (function () {
    const apiRouter = express.Router();

    // Users routes

    // Register routes
    apiRouter.route('/users/register/').post(usersController.register);

    // Login routes
    apiRouter.route('/users/login/').post(usersController.login);

    // Get user profile
    apiRouter.route('/users/me').get(usersController.getUserProfile);

    // Update account informations
    apiRouter.route('/users/me/update').put(usersController.updateAccount);

    // Update user password
    apiRouter.route('/users/update-password').put(usersController.updateUserPassword);

    // Search user by email
    apiRouter.route('/users/search/user-by-email').get(usersController.searchUserByEmail);

    // Get all courses
    apiRouter.route('/users/all').get(usersController.getAll);

    // Horses routes

    // Add horse
    apiRouter.route('/horses/add').post(horsesController.add);

    // Update horse
    apiRouter.route('/horses/update').put(horsesController.update);

    // Delete horse
    apiRouter.route('/horses/delete').delete(horsesController.delete);

    // Show horse
    apiRouter.route('/horses/show/:id').get(horsesController.show);

    // Get all horses
    apiRouter.route('/horses/all').get(horsesController.getAll);


    // Courses routes

    // Add a courses
    apiRouter.route('/courses/add').post(coursesController.add);

    // Update course
    apiRouter.route('/courses/update').put(coursesController.update);

    // Delete course
    apiRouter.route('/courses/delete').delete(coursesController.delete);

    // Show course
    apiRouter.route('/courses/show').get(coursesController.show);

    // Get all courses
    apiRouter.route('/courses/all').get(coursesController.getAll);

    // Session routes

    // Add user to courses
    apiRouter.route('/session/add/user').post(sessionController.addUser);

    // Add horses to a user course
    apiRouter.route('/session/add/user/horse').post(sessionController.addHorse);

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
