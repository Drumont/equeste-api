// Imports
const jwtUtils = require('../assets/jwt.utils');
const response = require('../apiRouter');
var models = require('../models');
const asyncLib = require('async')
const userControllers = require('./UsersController');

const ADMIN_ID = 1;


 async function userAlreadyAdded(course_id, user_id) {
     return await models.Session.findAndCountAll({
         where: {
             user_id: user_id,
             course_id: course_id,
         }
     }).then(function ({count, rows}) {
         return (count >=1);
     }).catch(function (err) {});
 }

 async function horseAlreadyAdded(course_id, horse_id) {
     return await  models.Session.findAndCountAll({
         where: {
             course_id: course_id,
             horse_id: horse_id
         }
     }).then(function ({count, rows}) {
         return (count>=1);
     }).catch(function (err) {})
 }

async function horseAlreadyAddedToUser(course_id, user_id, horse_id) {
    return await  models.Session.findAndCountAll({
        where: {
            user_id: user_id,
            course_id: course_id,
            horse_id: horse_id
        }
    }).then(function ({count, rows}) {
        return (count>=1);
    }).catch(function (err) {})
}

// Routes
module.exports = {

    // Add a user to a course
    addUser: async function (req, res) {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var user = jwtUtils.getUser(headerAuth);

        var course_id = req.body.course_id;

        if ( await userAlreadyAdded(course_id, user.userId)) {
            return res.status(500).json({'error': 'This user is already add to this course'});
        }

        asyncLib.waterfall([
            function (done) {
                var newSession = models.Session.create({
                    course_id: course_id,
                    user_id: user.userId
                })
                    .then(function (newSession) {
                        done(null, newSession);
                    })
                    .catch(function (err) {
                        return res.status(500).json(response.error('Cannot add user to session'))
                    })
            },
            function (newSession) {
                if (newSession) return res.status(201).json(response.success(newSession))
                else res.status(500).json(response.error('Cannot add horse' + err))
            }
        ])

    },

    addHorse: async function (req, res) {
        let headerAuth = req.headers['authorization'];
        let user = jwtUtils.getUser(headerAuth);

        let horse_id = req.body.horse_id;
        let course_id = req.body.course_id;

        if ( await horseAlreadyAdded(course_id, horse_id)) {
            return res.status(500).json({'error': 'This horse is already add to smb in this course '});
        }

        asyncLib.waterfall([
            function (done) {
                models.Session.findOne({
                    where: { course_id: course_id, user_id: user.userId}
                }).then(function (sessionFound) {
                    console.log(sessionFound);
                    done(null, sessionFound);
                }).catch(function (err) {
                    return res.status(500).json({ 'error': 'unable to verify session' });
                });
            },
            function (sessionFound, done) {
                if(userControllers.isAble(user.userId)) {
                    sessionFound.update({
                        horse_id: (horse_id ? horse_id : sessionFound)
                    })
                        .then(function () {
                            done(null, sessionFound)
                        })
                        .catch(function (err) {
                            res.status(500).json(response.error('cannot update session' ));

                        })
                } else res.status(404).json(response.error('You cannot add horse - Permission insufficient'))
            },
            function (sessionFound) {
                if (sessionFound) {
                    return res.status(201).json(response.success(sessionFound));
                } else {
                    return res.status(500).json(response.error('cannot update session profile'));
                }
            }
        ])
    },


}
