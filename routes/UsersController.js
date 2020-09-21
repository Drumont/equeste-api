// Imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');
const asyncLib = require('async')

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

// Routes
module.exports = {

    // Resgister function
    register: function (req, res){

        //Params
        var email = req.body.email;
        var password = req.body.password;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var licence = req.body.licence;
        var phone = req.body.phone;

        if(email == null || password == null || firstname == null){
            return res.status(400).json(response.error('Missing parameters'));
        }
        if(!EMAIL_REGEX.test(email)){
            return res.status(400).json(response.error('Email is not valid'));
        }
        if(!PASSWORD_REGEX.test(password)){
            return res.status(400).json(response.error('Password invalid - Password must be between 4 and 8 digits long and include at least one numeric digit'));
        }

        // Waterfall
       asyncLib.waterfall([
           function (done) {
               models.User.findOne({
                   attributes: ['email'],
                   where: {email: email}
               })
                   .then(function (userFound) {
                       done(null, userFound);
                   })
                   .catch(function (err) {
                       return res.status(500).json(response.error('Unable to verify user'));
                   })
           },
           function (userFound, done) {
               if(!userFound) {
                   // Account creation
                   var newAccount = models.Account.create({
                       firstname: firstname,
                       lastname: lastname,
                       licence: licence,
                       phone: phone
                   })
                       .then(function (newAccount){
                            done(null, userFound, newAccount);
                       })
                       .catch(function (err) {
                           return res.status(500).json(response.error('Cannot add Account '+err))
                       })
               }
               else {
                   return res.status(409).json(response.error('User already exits'));
               }
           },
           function (userFound, newAccount, done) {
               if (!userFound) {
                   bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                       done(null, userFound, newAccount, bcryptedPassword);
                   });
               } else {
                   return res.status(409).json({ 'error': 'user already exist' });
               }
           },
           function (userFound, newAccount, bcryptedPassword, done) {
               // User creation
               var newUser = models.User.create({
                   email: email,
                   password: bcryptedPassword,
                   account_id: newAccount.id,
                   permission_id: 1
               })
                   .then(function (newUser) {
                       done(null, newUser);
                   })
                   .catch(function (err) {
                       return res.status(500).json(response.error('Cannot add User'+err))
                   })
           },
           function (newUser) {
               if (newUser){
                   return res.status(201).json(response.success(newUser.id))
               } else {
                   return res.status(500).json(response.error('Cannot add User'+err))
               }
           }

       ])

        /*
        models.User.findOne({
            attributes: ['email'],
            where: {email: email}
        })
            .then(function (userFound){
                if(!userFound){

                    // Account creation
                    var newAccount = models.Account.create({
                        firstname: firstname,
                        lastname: lastname,
                        licence: licence,
                        phone: phone
                    })
                        .then(function (newAccount) {

                            // Bcrypt password
                            bcrypt.hash(password, 5, function (err, bcryptedPassword){

                                // User creation
                                var newUser = models.User.create({
                                    email: email,
                                    password: bcryptedPassword,
                                    account_id: newAccount.id,
                                    permission_id: 1
                                })
                                    .then(function (newUser) {
                                        return res.status(201).json(response.success(newUser.id))
                                    })
                                    .catch(function (err) {
                                        return res.status(500).json(response.error('Cannot add User'+err))
                                    })
                            })
                        })

                        .catch(function (err) {
                            return res.status(500).json(response.error('Cannot add Account '+err))
                         })


                }else{
                    return res.status(409).json(response.error('User already exits'));
                }
            })
            .catch(function (err){
                return res.status(500).json(response.error('Unable to verify user'));
            });
        */
    },

    // Login function
    login: function (req, res){

        // Params
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json(response.error('Missing parameters'));
        }

        //Waterfall
        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    where: {email: email}
                })
                    .then(function (userFound){
                        done(null, userFound);
                    })
                    .catch(function (err){
                        return res.status(500).json(response.error('Unable to verify user'));

                    })
            },
            function (userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        done(null, userFound, resBycrypt);
                    });
                } else {
                    return res.status(404).json(response.error('User not exist in DB'));
                }
            },
            function (userFound, resBycrypt, done) {
                if(resBycrypt) {
                    done(null, userFound);
                }
                else {
                    return res.status(403).json(response.error('Invalid password'));
                }
            },
            function (userFound) {
                if (userFound){
                    return res.status(200).json(response.success({
                        'user_id': userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound)
                    }));
                }
                else {
                    return res.status(403).json(response.error('Cannot log User'));
                }
            }
        ])

        /*
        models.User.findOne({
            where: {email: email}
        })
            .then(function (userFound) {
                if(userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if(resBycrypt) {
                            return res.status(200).json(response.success({
                                'user_id': userFound.id,
                                'token': jwtUtils.generateTokenForUser(userFound)
                            }));
                        }
                        else {
                            return res.status(403).json(response.error('Invalid password'));
                        }
                    })
                } else {
                    return res.status(404).json(response.error('User not exist in DB'));
                }
            })
            .catch(function (err) {
                return res.status(500).json(response.error('Unable to verify user'));
            })

         */
    },

    // User profile
    getUserProfile: function (req, res){

        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUser(headerAuth).userId;

        if (userId < 0) {
            return res.status(400).json(response.error('Wrong token'))
        } else {
            models.User.findOne({
                attributes: [ 'id', 'email', 'account_id', 'permission_id'],
                where: { id: userId }
            })
                .then(function (user) {
                    if (user) {
                        res.status(201).json(response.success(user));
                    } else {
                        res.status(404).json(response.error('User not found'));
                    }
                })
                .catch(function (err) {
                    res.status(500).json(response.error('Cannot fetch user'+err));
                });
        }
    },

    // Update user
    UpdateUserProfile: function (req, res) {

        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUser(headerAuth).userId;

        // Params
        //var email = req.body.email;
        //var password = req.body.password;
        var permission_id = req.body.permission_id;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'permission_id'],
                    where: { id: userId }
                })
                    .then(function (userFound) {
                    done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function(userFound, done) {
                if(userFound) {
                    userFound.update({
                        permission_id: (permission_id ? permission_id : userFound.permission_id)
                    }).then(function() {
                        done(userFound);
                    }).catch(function(err) {
                        res.status(500).json(response.error('cannot update user' ));
                    });
                } else {
                    res.status(404).json(response.error('user not found' ));
                }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(response.success(userFound));
            } else {
                return res.status(500).json(response.error( 'cannot update user profile' ));
            }
        });

    }
}
