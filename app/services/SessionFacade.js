var articleService = require('./ArticleService').ArticleService;
var userService = require('./UserService').UserService;

var sessionFacade = {

    addArticle : function(articleDTO, userDTO, success, failed) {
        var user = TOA.fromUserDTO(userDTO);
        var article = TOA.fromArticleDTO(articleDTO);

        article.writerId = user._id;

        articleService.addArticle(article, function(err, article) {
            if (err) {
                failed(err);
            } else {
                success(article);
            }
        });
    },

    getArticles : function(userDTO, success, failed) {
        var userArticles = [];

        if (userDTO != null) {
            var user = TOA.fromUserDTO(userDTO);
            var username = user.username;

            userService.getUser(username, function (user, err) {
                if (err) {
                    console.log('the user ' + username + 'is not available - ' + err);
                    failed();

                } else if (user) {
                    articleService.getArticles(function (articles, err) {
                        if (articles) {
                            for (var articleId in articles) {
                                var article = articles[articleId];

                                if (article._writerId.toHexString() == user._id.toHexString()) {
                                    userArticles.push(TOA.toArticleDTO(article, TOA.toUserDTO(user)));
                                }
                            }
                            success(userArticles);
                        }
                        else {
                            failed(err);
                        }
                    });
                }
            });
        }
    },

    getAllArticles : function(sucess, failure) {
        articleService.getArticles(function(articles, err) {
            if (err) {
                failure(err);

            } else {
                TOA.toArticlesDTO(articles, function(dtos) {
                    sucess(dtos);
                });

            }
        });
    },

    findUserById : function (userId, success, failed) {
        userService.getUserById(userId, function(user, err) {
            if (err) {
                failed(err);
            } else {
                success(user);
            }
        });
    }
};
var TOA = {
    toArticlesDTO : function(entities) {
        var articles = [];

        for (var articleId in entities) {
            var article = entities[articleId];
            sessionFacade.findUserById(article._writerId, function (user) {
                var userDTO = TOA.toUserDTO(user);
                articles.push(TOA.toArticleDTO(article, userDTO));

            });
        }

        return articles;
    },

    toArticleDTO: function (entity, associatedUser) {
        return {
            title: entity.title,
            content: entity.content,
            writer: associatedUser.username
        }
    },

    //TODO modify
    fromArticleDTO: function (articleDTO) {
        var article = new articleDao();
        article.title = articleDTO.title;
        article.content = articleDTO.content;
        article.writerId = articleDTO.writerId;

        return article;
    },

    toUserDTO : function(userEntity) {
        return {
            username: userEntity.username,
            articles: userEntity.articles
        }
    },

    //TODO change to credentials
    fromUserDTO : function(userDTO) {
        return {
            username : userDTO.username,
            secret: userDTO.secret
        }
    }
};


module.exports.SessionFacade = sessionFacade;
