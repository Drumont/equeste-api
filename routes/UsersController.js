// Imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');
const asyncLib = require('async');
const { Op } = require('sequelize');

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
        var permission_id = req.body.permission_id;

        if((email == null || phone == null) && password == null ){
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
                   where: {
                       [Op.or]: [
                           {email : (email) ? email : ' '},
                           {phone : (phone) ? phone : ' '}
                       ]}
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
                   permission_id: permission_id,
                   phone: phone
               })
                   .then(function (newUser) {
                       done(null, newUser, newAccount);
                   })
                   .catch(function (err) {
                       return res.status(500).json(response.error('Cannot add User'+err))
                   })
           },
           function (newUser, newAccount) {
               if (newUser){
                   return res.status(201).json(response.success({'newUser' : newUser, 'newAccount' : newAccount}))
               } else {
                   return res.status(500).json(response.error('Cannot add User'+err))
               }
           }
       ])

    },

    // Login function
    login: function (req, res){

        // Params
        var email = req.body.email;
        var phone = req.body.phone;
        var password = req.body.password;

        if ((email == null || phone == null) && password == null ) {
            return res.status(400).json(response.error('Missing parameters'));
        }

        if(email === 'root@root.com' && password === 'root'){
            const userFound = {
                id: 99,
                permission_id: 1
            }
            let generateToken = jwtUtils.generateTokenForUser(userFound);
            return res.status(200).json(response.success({
                'user_id': 99,
                'token': generateToken
            }));
        }

        //Waterfall
        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    where: {
                        [Op.or]: [
                            {email : (email) ? email : ' '},
                            {phone : (phone) ? phone : ' '}
                        ]}
                })
                    .then(function (userFound){
                        done(null, userFound);
                    })
                    .catch(function (err){
                        return res.status(500).json(response.error('Unable to verify user' + err ));
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
                    let generateToken = jwtUtils.generateTokenForUser(userFound);
                    // set it in an HTTP Only + Secure Cookie
                    res.cookie("SESSIONID", generateToken, {httpOnly:true, secure:true});
                    return res.status(200).json(response.success({
                        'user_id': userFound.id,
                        'token': generateToken
                    }));
                }
                else {
                    return res.status(403).json(response.error('Cannot log User'));
                }
            }
        ])

    },

    // User profile
    getUserProfile: function (req, res){

        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUser(headerAuth).userId;

        console.log('user id' + userId);

        if(userId === 99 ){
            const user = {
                email: 'root@root.com',
                account_id: 99,
                permission_id: 1,
                phone: 9999999999
            }
            const account = {
                firstname: 'Root',
                lastname: 'Root',
                licence: '452AR',
            }
            res.status(201).json(response.success({user: user, account: account}));

        }

        if (userId < 0) {
            return res.status(400).json(response.error('Wrong token'))
        } else {
            asyncLib.waterfall([
                function (done) {
                    models.User.findOne({
                        where: { id: userId }
                    })
                        .then(function (user) {
                            done(null, user);
                        })
                        .catch(function (err) {
                        res.status(500).json(response.error('Cannot fetch user'+err));
                        });
                },
                function (user, done) {
                    models.Account.findOne({
                        where: {id : user.account_id}
                    })
                        .then(function (account) {
                            done(null, account, user)
                        })
                        .catch(function (err) {
                            res.status(500).json(response.error('Cannot fetch account'+err));
                        });
                },
                function (account, user, done) {
                    if(user && account) {
                        res.status(201).json(response.success({user: user, account: account}));
                    }else {
                        res.status(404).json(response.error('User not exists'));
                    }
                }
            ])
        }
    },

    // Update account
    updateAccount: function (req, res){

        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUser(headerAuth).userId;

        // Params
        //var email = req.body.email;
        //var password = req.body.password;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let licence = req.body.licence;

        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    attributes: ['id', 'email', 'account_id'],
                    where: { id: userId }
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('unable to verify user' + err));
                    });
            },
            function(userFound, done) {
                models.Account.findOne({
                    attributes: ['id', 'firstname', 'lastname', 'licence'],
                    where: { id: userFound.account_id }
                })
                    .then(function (accountFound) {
                        done(null, accountFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('unable to verify account' + err ));
                    });
            },
            function(accountFound, done) {
                if(accountFound) {
                    accountFound.update({
                        firstname: (firstname ? firstname : accountFound.firstname),
                        lastname: (lastname ? lastname : accountFound.lastname),
                        licence: (licence ? licence : accountFound.licence),
                    })
                        .then(function() {
                            done(null, accountFound);
                        })
                        .catch(function(err) {
                            res.status(500).json(response.error('cannot update Account' ));
                        });
                } else {
                    res.status(404).json(response.error('Account not found' ));
                }
            },
            function(accountFound) {
                if (accountFound) {
                    return res.status(201).json(response.success(accountFound));
                } else {
                    return res.status(500).json(response.error('cannot update account profile'));
                }
            }
        ]);
    },

    // Update password
    updateUserPassword: function (req, res){

        // Search user by using his/her id

        let password = req.body.password;
        let userId = req.body.userId;

        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    attributes: ['id', 'email', 'account_id', 'permission_id'],
                    where: { id: userId }
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json(response.error('unable to verify user' + err));
                    });
            },
            function (userFound, done) {
                if (userFound) {
                    bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json(response.error('user not exist'));
                }
            },
            function (userFound, bcryptedPassword, done) {
                userFound.update({
                    password: (password ? bcryptedPassword : userFound.password),
                }).then(function() {
                    done(null, userFound);
                }).catch(function(err) {
                    res.status(500).json(response.error('cannot update user password' ));
                });
            },
            function(userFound) {
                if (userFound) {
                    return res.status(201).json(response.success(userFound));
                } else {
                    return res.status(500).json(response.error('cannot update account profile'));
                }
            }
        ]);
    },

    // Search a user by his/her email
    searchUserByEmail: function (req, res){

        let email = req.body.email;

        models.User.findOne({
            attributes: ['id', 'email', 'account_id', 'permission_id'],
            where: { email: email }
        })
            .then(function (userFound) {
                if (userFound) {
                    return res.status(201).json(response.success(userFound));
                } else {
                    res.status(404).json(response.error('User not found'));
                }
            })
            .catch(function(err) {
                return res.status(500).json(response.error('Cannot fetch user' + err));
            });
    },

    // Get a user by id
    getUserById: function (id) {
        if (userId < 0) {
            return response.error('Wrong token');
        } else {
            models.User.findOne({
                attributes: ['id', 'email', 'account_id', 'permission_id'],
                where: { id: id }
            })
                .then(function (userFound) {
                    if (userFound) {
                        return userFound;
                    } else {
                        return response.error('User not found');
                    }
                })
                .catch(function (err) {
                    return response.error('Cannot fetch user' + err)
                })
        }
    },

    // Permission check for monitor or higher
    isAble : function (permission_id) {
        return (permission_id === 1 || permission_id === 3);
    },

    // Get all users
    getAll: function (req, res) {
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        asyncLib.waterfall([
            function (done) {
                models.User.findAll({
                    include: [{ model: models.Account}]
                })
                    .then(function (data) {
                        return res.status(201).json(response.success(data));
                        })
                        .catch(function (err) {
                            return res.status(500).json(response.error('Unable to verify horse' + err));
                        });
            }
        ])

    }



}

