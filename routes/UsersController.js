// Imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');

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

        // TODO verify email regex, password

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

    },

    // Login function
    login: function (req, res){

        // Params
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json(response.error('Missing parameters'));
        }

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
    }
}
