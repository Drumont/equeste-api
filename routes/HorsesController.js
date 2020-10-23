// Imports
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');
const asyncLib = require('async')
const userControllers = require('./UsersController');

const ADMIN_ID = 1;


// Routes
module.exports = {

    // Add a Horse
    add: function (req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUser(headerAuth).userId;

        var name = req.body.name;
        var breed = req.body.breed;

        if(name == null){
            return res.status(400).json(response.error('Missing parameters'));
        }

        if (userId < 0) {
            return res.status(400).json(response.error('Wrong token'))
        } else {

            asyncLib.waterfall([
                function (done) {
                    models.User.findOne({
                        attributes: ['id', 'email', 'account_id', 'permission_id'],
                        where: { id: userId }
                    })
                        .then(function (user) {
                            if (user) {
                                done(null, user)
                            } else {
                                res.status(404).json(response.error('User not found'));
                            }
                        })
                        .catch(function (err) {
                            res.status(500).json(response.error('Cannot fetch user'+err));
                        });
                },
                function (user, done) {
                    if(user.permission_id == ADMIN_ID) {
                        var newHorse = models.Horse.create({
                            name: name,
                            createdBy_id: user.id,
                            breed: breed
                        })
                            .then(function (newHorse) {
                                done(null, newHorse);
                            })
                            .catch(function (err) {
                                return res.status(500).json(response.error('Cannot add horse'))
                            })
                    } else {
                        return res.status(500).json(response.error('You cannot add horse due to your permission'))
                    }
                },
                function (newHorse) {
                    if(newHorse) return res.status(201).json(response.success(newHorse))
                    else res.status(500).json(response.error('Cannot add horse'+err))
                }
            ])
        }
    },

    // Update a horse
    update: function(req, res) {
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let id = req.body.id;
        let name = req.body.name;
        let breed = req.body.breed;

        asyncLib.waterfall([
            function (done) {
                models.Horse.findOne({
                    attributes: ['id', 'name', 'createdBy_id', 'breed'],
                    where: { id: id }
                })
                    .then(function (horseFound) {
                        done(null, horseFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('Unable to verify horse' + err));
                    });
            },
            function (horseFound, done) {
                if(user.permission_id == ADMIN_ID) {
                    horseFound.update({
                        name: (name ? name : horseFound.name),
                        breed: (breed ? breed : horseFound.breed),
                    })
                        .then(function () {
                            done(null, horseFound);
                        })
                        .catch(function(err) {
                            res.status(500).json(response.error('cannot update horse'));
                        });
                }
                else {
                    return res.status(500).json(response.error('You cannot add horse due to your permission'))
                }
            },
            function (horseFound) {
                if (horseFound) {
                    return res.status(201).json(response.success(horseFound));
                } else {
                    return res.status(500).json(response.error('cannot fetch horse '));
                }
            }
        ]);
    },

    // Delete a horse
    delete: function(req, res) {
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let id = req.body.id;

        asyncLib.waterfall([
            function (done) {
                models.Horse.findOne({
                    attributes: ['id', 'name', 'createdBy_id', 'breed'],
                    where: { id: id }
                })
                    .then(function (horseFound) {
                        done(null, horseFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('Unable to verify horse' + err));
                    });
            },
            function (horseFound, done) {
                if(user.permission_id == ADMIN_ID) {
                    horseFound.destroy()
                        .then(function () {
                            return res.status(201).json(response.success('Horse delete'));
                        })
                        .catch(function(err) {
                            res.status(500).json(response.error('cannot update horse'));
                        });
                }
                else {
                    return res.status(500).json(response.error('You cannot add horse due to your permission'))
                }
            },
        ]);

    },

    // Read
    show: function (req, res){
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let id = req.body.id;

        asyncLib.waterfall([
            function (done) {
                models.Horse.findOne({
                    attributes: ['id', 'name', 'createdBy_id', 'breed'],
                    where: { id: id }
                })
                    .then(function (horseFound) {
                        return res.status(201).json(response.success(horseFound));
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('Unable to verify horse' + err));
                    });
            },
        ]);
    }


}
