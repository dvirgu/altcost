var userDao = require('../models/user');


var userService = {

    addUser: function (userDTO) {
        var callback = args.pop();

        userDao.findOne(userDTO.username, function (err, entity) {
            if (entity) {
                return callback("user already exists", null);
            }
        });

        userDao.create(TOA.fromUserDTO(userDTO), function (err) {
            if (err) return callback(err, null);
        })
    },

    getUser: function (username, callback) {

        userDao.findOne({username: username }, function (err, entity) {
            if (err) {
                callback(null, err);

            } else {
                callback(entity, null);
            }
        });
    },

    getUserById: function (userId, callback) {

        userDao.findOne({_id: userId }, function (err, entity) {
            if (err) {
                callback(null, err);
            } else {
                callback(entity, null);
            }
        })
    }
};



module.exports.UserService = userService;
