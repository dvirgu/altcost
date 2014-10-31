var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema   = new Schema({
//    _id:        Schema.Types.ObjectId,
    title:          String,
    content:        String,
    keywords:       [String],
    _writerId:      Schema.Types.ObjectId,
    lastUpdateDate: Date,
    creationDate:   Date
});

var ArticleModel = mongoose.model('Article', ArticleSchema);

module.exports = ArticleModel;