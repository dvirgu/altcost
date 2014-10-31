var express = require('express');
var auth = require('../../config/auth').AuthProvider;
var articleRouter = express.Router();
var facade = require('../services/SessionFacade').SessionFacade;
var Promise = require('promise');

articleRouter.get('/', function(req, res, next) {
    var articles;

    var user =  req.query.user;
    if (user) {
        articles = filterArticleByUser(user);
    } else {
        articles = getAllArticle();
    }

    sendResponse(articles, res, next);
});


function filterArticleByUser(user) {
    console.log("return articles by user " + user);

    return null;
    //TODO
}

function getAllArticle() {
    console.log("return all articles");

    var promise = Promise.resolve(function() {
        facade.getAllArticles(function(articles) {
            return articles;
        }, function() {
            reject();
        });
    });

    return promise;
}


function sendResponse(entitiesAsPromise, res, next) {
    if (entitiesAsPromise) {
        entitiesAsPromise.then(res.json);
    } else {
        next();
    }
}

module.exports.articleRouteSetup = function(app) {
    app.use('/articles', articleRouter);
    return articleRouter;
};