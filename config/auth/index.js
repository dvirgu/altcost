var Strategy = require('passport-http');
var passportInstance = require('passport');
var UserDao = require('../../app/models/user');

module.exports = {

    AuthStrategy: function (strategyType) {

        if (strategyType == "basic") {

            return new Strategy.BasicStrategy (
                function (username, password, done) {
                    UserDao.findOne({ username: username },
                        function (err, user) {
                            if (err) {
                                return done(err);
                            }
                            if (!user) {
                                return done(null, false);
                            }
                            if (!user.validPassword(password)) {
                                return done(null, false);
                            }
                            return done(null, user);
                        });
                }
            );
        }
    },

    AuthProvider: passportInstance

};