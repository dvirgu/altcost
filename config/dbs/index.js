var mongoose   = require('mongoose');

var Mongoose = function(dbAddress) {

    if (!dbAddress) {
        dbAddress = 'mongodb://localhost/testDb';
    }

    mongoose.connect(dbAddress);
};

module.exports = Mongoose;
