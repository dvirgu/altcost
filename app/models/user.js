var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema   = new Schema({
    /*_id:        Schema.Types.ObjectId,*/
    username:   String,
    secret:     String,
    name:       String,
    articles:    [Schema.Types.ObjectId]

});

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;