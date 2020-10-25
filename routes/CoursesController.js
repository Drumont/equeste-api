// Imports
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');
const asyncLib = require('async')
const userControllers = require('./UsersController');

const ADMIN_ID = 1;

module.exports = {

    // Add a course
    add: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var user = jwtUtils.getUser(headerAuth);

        var title = req.body.title;
        var description = req.body.description;
        var started_date = req.body.started_date;
        var duration = req.body.duration;

        if(title == null){
            return res.status(400).json(response.error('Missing parameters'));
        }

        if (user.id < 0) {
            return res.status(400).json(response.error('Wrong token'))
        } else {
            asyncLib.waterfall([
                function (done) {
                    if(userControllers.isAble(user.permission_id)) {
                        var newCourse = models.Course.create({
                            title: title,
                            description: description,
                            started_date: started_date,
                            duration: duration,
                            createdBy_id: user.userId
                        })
                            .then(function (newCourse) {
                                done(null, newCourse);
                            })
                            .catch(function (err) {
                                return res.status(500).json(response.error('Cannot add course'))
                            });
                    } else
                        return res.status(500).json(response.error('You cannot add a course due to your permission'))
                },
                function (newCourse) {
                    if(newCourse) return res.status(201).json(response.success(newCourse))
                    else res.status(500).json(response.error('Cannot add course'+err))
                }
            ])
        }


    },

    // Update a course
    update: function (req, res) {
        var headerAuth = req.headers['authorization'];
        var user = jwtUtils.getUser(headerAuth);

        var title = req.body.title;
        var description = req.body.description;
        var started_date = req.body.started_date;
        var duration = req.body.duration;
        var course_id = req.body.course_id

        if(title == null){
            return res.status(400).json(response.error('Missing parameters'));
        }

        if (user.id < 0) {
            return res.status(400).json(response.error('Wrong token'))
        } else {
            asyncLib.waterfall([
                function (done) {
                    models.Course.findOne({
                        attributes: ['id', 'title', 'description', 'started_date', 'createdBy_id'],
                        where: { id: course_id}
                    })
                        .then(function (courseFound) {
                            done(null, courseFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json(response.error('Unable to verify Course' + err));
                        });
                },
                function (courseFound, done) {
                    if(userControllers.isAble(user.permission_id)) {
                        courseFound.update({
                            title: (title ? title : courseFound.title),
                            description: (description ? description : courseFound.description),
                            started_date: (started_date ? started_date : courseFound.started_date),
                            duration: (duration ? duration : courseFound.duration),
                        })
                            .then(function () {
                                done(null, courseFound);
                            })
                            .catch(function (err) {
                                return res.status(500).json(response.error('Cannot update course'))
                            });
                    } else
                        return res.status(500).json(response.error('You cannot update a course due to your permission'))
                },
                function (courseFound) {
                    if(courseFound) return res.status(201).json(response.success(courseFound))
                    else res.status(500).json(response.error('Cannot add course'+err))
                }
            ])
        }


    },

    // Delete a course
    delete: function (req, res) {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let course_id = req.body.course_id;

        asyncLib.waterfall([
            function (done) {
                models.Course.findOne({
                    attributes: ['id', 'title', 'description', 'started_date', 'createdBy_id'],
                    where: { id: course_id}
                })
                    .then(function (courseFound) {
                        done(null, courseFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('Unable to verify Course ' + err));
                    });
            },
            function (courseFound) {
                if(userControllers.isAble(user.permission_id)) {
                    courseFound.destroy()
                        .then(function () {
                            return res.status(201).json(response.success('Course delete'));
                        })
                        .catch(function(err) {
                            res.status(500).json(response.error('cannot delete course'));
                        });
                }
                else {
                    return res.status(500).json(response.error('You cannot delete course due to your permission'))
                }
            },
        ]);
    },

    // Show course
    show: function (req, res) {
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let course_id = req.body.course_id;

        asyncLib.waterfall([
            function (done) {
                models.Course.findOne({
                    attributes: ['id', 'title', 'description', 'started_date', 'createdBy_id'],
                    where: { id: course_id }
                })
                    .then(function (courseFound) {
                        return res.status(201).json(response.success(courseFound));
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('Unable to verify course' + err));
                    });
            },
        ]);
    },


}
