var articleDao = require('../models/article');


var articleService = {

    getArticles : function(callback) {

        articleDao.find().lean().exec(function(err, articles) {
           callback(articles, err);
        });

    },

    getArticle : function(articleId) {
        var callback = args.pop();

        articleDao.findById(articleId, function(err, entity) {
            if (err) return callback(err, null);
            return callback (null, entity);
        });
    },

    addArticle : function(article, callback) {

        articleDao.findOne(article.id, function(err, entity) {
            if (err) return callback(err, null);
            if (entity) return callback("article already exists", null);
        });

        articleDao.create(article, function(err, article) {
            if (err) return callback(err, null);
            else callback(null, article);

        });
    },

    updateArticle : function(article) {
        articleDao.findOne(article.id, function(err, entity) {
            if (err) return callback(err, null);

            article.save();
        });
    }

};


module.exports.ArticleService = articleService;
