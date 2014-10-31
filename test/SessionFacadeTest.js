require('../config/dbs')('mongodb://localhost/testDb');
var assert = require('assert');

var testedSessionFacade = require('../app/services/SessionFacade').SessionFacade;

var userDao = require('../app/models/user');
var articleDao = require('../app/models/article');

describe('sessionFacadeTest', function() {

    beforeEach(function (done) {
        userDao.create({
                username: 'dvirgu@gmail.com',
                secret: '1234',
                name: 'Dvir Guetta'
                },

            function (err, user) {
                articleDao.create({
                        title: 'myTestTitle',
                        content: 'some content',
                        keywords: ['keyword'],
                        _writerId: user._id},

                    function (err, article) {
                        userDao.update(user, {articles: [article._id]});
                        done();
                    });
            });
    });

    afterEach(function (done) {
        userDao.remove({}, function(err){});
        articleDao.remove({}, function(err){});
        done();
    });

    it('#getArticlesByUser()', function (done) {
        var userDTO = { username: "dvirgu@gmail.com"};
        testedSessionFacade.getArticles(userDTO, function (allArticles) {

            console.log('articles ' + allArticles);

            assert.ok(allArticles);
            assert.equal(allArticles.length, 1);
            done();

        }, function(err) {
            assert.fail(err);
        });
    });

    it("#addArticle()", function(done) {
        done();
    });

    it('#getAllArticles())', function(done) {
        testedSessionFacade.getAllArticles(function(articles) {

            assert.ok(articles);
            assert.equal(articles.length, 1);

            console.log('the articles ' + articles);
            done();

        }, function() {
            assert.fail();
        });
    })
});