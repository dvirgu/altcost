var express = require('express');
var auth = require('../../config/auth').AuthProvider;
var usersRouter = express.Router();
var userDao = require('../models/user');

/* GET users listing. */
usersRouter.get('/',
    auth.authenticate('basic', { session: false }),

    function(req, res, user) {
        console.log('try to retrieve user ' + user);

        userDao.findOne(user.username, function(err, entities) {
            if (err) {
                res.set('WWW-Authenticate', 'myBasic');
                res.send(err);
                return;
            }

            res.json(entities);
        });
});

//usersRouter.get('/:userId', function(req, res) {
//    var userId = req.params.userId;
//    console.log("try to find user with id : " + userId);
//
//    userDao.findById(userId, function (err, entity) {
//        if (err) {
//            res.status(400);
//            res.json(err);
//            return;
//        }
//
//        res.json(entity);
//    });
//});

usersRouter.post('/', function(req, res) {
    var user = req.body;
    console.log("create a new user " + user);

    userDao.create({
        username : user.username,
        secret : user.secret
    }, function (err, user) {
        if (err) {
            res.status(400);
            res.json(err);
        }
    });

    //userDao.save(user);
    res.status(201);
    res.json({user: user, message: 'new user created' });

});

module.exports.userRouteSetup = function(app) {
    app.use('/users', usersRouter);
    return usersRouter;
};
