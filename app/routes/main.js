var express = require('express');
var mainRouter = express.Router();
var auth = require('../../config/auth').AuthProvider;

/* GET home page. */
mainRouter.get('/', function(req, res) {//appModule, scriptSrc, title, ctrl
    res.sendfile("views/applicationPage.html");

    /*res.render('applicationPage', {
        title: 'AltCost',
        appModule: 'altCostApp',
        scriptSrc: 'javascripts/singlePageApp.js'
    });*/

});

mainRouter.get('challengeServer/', auth.authenticate('basic', {session: false}),
    function(req, res, info) {

        res.set('WWW-Authenticate', 'myBasic realm=' + info);
        res.send();
});

module.exports.mainRouteSetup = function(app) {
    app.use('/', mainRouter);
    return mainRouter;
};
