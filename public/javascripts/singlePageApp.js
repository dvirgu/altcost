/* -------------- Mock Module ----------------- */

angular.module('myServerMock',['ngMockE2E'])
    .run(function($httpBackend, base64) {

        var validCredentials = function (user) {
            var isDvir = user.username === "dvirgu@gmail.com" && user.secret === "1234";
            var isShai = user.username === "shai@gmail.com" && user.secret === "1234";

            return isDvir || isShai;
        };

        //TODO should remove it
        $httpBackend.whenPOST('auth/login').respond(function(method, url, data) {
            var user = angular.fromJson(data);

            if (validCredentials(user)) {
                return [200, user];
            } else {
                return [401];
            }
        });

        //basic auth mock
        function getUserByCredentials(headers) {
            var authHeader = headers['Authorization'];
            if (authHeader) {
                var base64Cre = authHeader.split(' ').pop();
                var user_pass = base64.decode(base64Cre);
                var user = {
                    username: user_pass.split(':')[0],
                    secret: user_pass.split(':')[1]
                };
                return user;
            }

            return null;
        }

        $httpBackend.whenGET('users/').respond(function(method, url, data, headers) {

            var user = getUserByCredentials(headers);
            if (user != null && validCredentials(user)) {

                var userResp = createUserData(user);
                return [200, userResp];
            } else {
                return [401, 'WWW-Authenticate: Basic realm=altcost'];
            }
        });

        function createUserData(user) {

            var userResp;

            if (user.username === "dvirgu@gmail.com") {

                userResp = {
                    name: "Dvir Guetta",
                    username: "dvirgu@gmaill.com",
                    articleId: [1, 4]
                };

            } else {
                userResp = {
                    name: "Shay Ben Yacov",
                    username: "shai@gmaill.com",
                    articleId: [5]
                };
            }

            return userResp;
        }

        $httpBackend.whenGET('challengeServer/').respond(function(method, url, data, headers) {

            var user = getUserByCredentials(headers);
            if (user != null && validCredentials(user)) {
                return [200];
            } else {
                return [401, 'WWW-Authenticate: Basic realm=altcost'];
            }
        });

        $httpBackend.whenGET('articles/').respond(function(method, url, data, headers) {

            var user = getUserByCredentials(headers);

            var articles;

            if (user != null && validCredentials(user)) {
                articles = createData(user);
            } else {
                articles = createAllData();
            }

            return [200, articles];
        });

        $httpBackend.whenPOST('articles/').respond(function(method, url, data, headers) {

            var user = getUserByCredentials(headers);
            if (user != null && validCredentials(user)) {
                addUpdateArticle(data, user);
                return [200];
            } else {
                return [401, 'WWW-Authenticate: Basic realm=altcost'];
            }
        });

        function addUpdateArticle(data, user) {
            var newArticle = angular.fromJson(data);

            if (!newArticle.id) {
                newArticle.writerId = user.username;
                newArticle.id = Object.keys(articleData)[articleData.length - 1] + 1;
                articleData[newArticle.id] = newArticle;
            } else {
                articleData[newArticle.id] = newArticle;
            }
        }

        var articleData = {
            1: {
                id: 1,
                title: "dvir's first article",
                content: "my name is dvir" +
                    "and this is my first article",
                keywords: ['test1', 'test2'],
                writerId: "dvirgu@gmail.com"
            },
            4: {
                id: 4,
                title: "dvir's sec article",
                content: "guetta's sec article",
                keywords: ['key1', 'key2', 'key3'],
                writerId: "dvirgu@gmail.com"
            },
            5: {
                id: 5,
                title: "shai's first article",
                content: "my name is shai and i am a douchebag",
                keywords: ['key1', 'key2', 'key3'],
                writerId: "shai@gmail.com"
            },
            9: {
                id: 9,
                title: "video content",
                content: "my name is shai and i am a douchebag",
                keywords: ['key1', 'key2', 'key3'],
                writerId: "shai@gmail.com"
            }
        };

        function createData(user) {
            var articles = [];

            for(var key in articleData) {
                if (articleData[key].writerId === user.username) {
                    articles.push(articleData[key]);
                }
            }

            return articles;
        }

        function createAllData() {
            var articles = [];

            for(var key in articleData) {
                articles.push(articleData[key]);
            }
            return articles;
        }

        $httpBackend.whenGET(/.*/).passThrough();
    }
);

/* ------------------- App Moudle ------------- */
var appModule = angular.module('altCostApp',
    [
        'ngRoute',
        'ngCookies',
        'textAngular',
        'http-auth-interceptor',
        'myServerMock',
        'ab-base64',
        'ngStorage'
    ]
);

//Router Config
appModule.config(function($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'partials/homePage.html'
        })

        .when('/edit', {
            templateUrl: 'partials/contentEditor.html'
        })

        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        })

        .otherwise({
            redirectTo: '/'
        });

//    $locationProvider.html5Mode(true);
});


appModule.run(function($rootScope, $location, AuthInfoService) {

    function redirectToLoginPage() {
        console.log("redirect to login page");
        $location.path('/login');
    }

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login', '/'];

    // check if current location matches route
    var isRequiredAuth = function (route) {
        var isExistent = _.indexOf(routesThatDontRequireAuth, route) > -1;
        return !isExistent;
    };

    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        console.log('in $routeChangeStart');

        if (isRequiredAuth($location.url()) && !AuthInfoService.isLoggedIn()) {
            redirectToLoginPage();
        }
    });

    $rootScope.$on('event:auth-loginRequired', function(event, data) {
        console.log("auth required");
        redirectToLoginPage();
    });

    $rootScope.$on('event:auth-loginCancelled', function(event, data) {
        console.log("auth cancelled");
        redirectToLoginPage();
    });
});

appModule.service('SessionStorageService', function wrapStorage($sessionStorage) {

    this.get = function (key) {
        return $sessionStorage[key];
    };

    this.put = function (key, value) {
        $sessionStorage[key] = value;
    };

    this.remove = function (key) {
        delete $sessionStorage[key];
    }
});

appModule.service('PersistentService', function($cookieStore, SessionStorageService) {

    var storage = $cookieStore.get('userSession') != null ? $cookieStore : SessionStorageService;

    this.setRememberMe = function(toRemember) {
        if (toRemember) {
            storage = $cookieStore;
        } else {
            storage = SessionStorageService;
            $cookieStore.remove('userSession');
        }
    };

    this.getCurrentUser = function() {
        return storage.get('userSession');
    };

    this.clearData = function() {
        storage.remove('userSession');
    };

    this.saveUser = function(user) {
        storage.put('userSession', user);
    };
});

appModule.service('AuthInfoService', function($http, PersistentService, base64, $rootScope) {

    this.enableRemeberMe = function() {
        PersistentService.setRememberMe(true);
    };

    this.disableRemeberMe = function() {
        PersistentService.setRememberMe(false);
    };

    this.setUserCredentials = function(userCredentials) {
        PersistentService.saveUser(userCredentials);
    };

    this.updateAuthHeader = function() {
        var user = PersistentService.getCurrentUser();

        if (user) {
            var encodedUserNameAndPassword = base64.encode(user.username + ':' + user.password);
            $http.defaults.headers.common.Authorization = 'Basic ' + encodedUserNameAndPassword;
        }
    };

    this.isLoggedIn = function() {
        return PersistentService.getCurrentUser() != null;
    };

    $rootScope.$on('event:auth-loginRequired', function(event, data) {
        PersistentService.clearData();
    });

    $rootScope.$on('event:auth-loginCancelled', function(event, data) {
        PersistentService.clearData();
    });

    $rootScope.$on('event:auth-loginConfirmed', function(event, user) {
        console.log('loginConfirmed');
    });
});

appModule.service('HttpClientService', function($http, AuthInfoService) {

    function setUser(userCredentials) {
        AuthInfoService.setUserCredentials(userCredentials);
    }

    function sendRequest(method, url, data, config) {
        AuthInfoService.updateAuthHeader();

        if (method == 'get') {
            return $http.get(url, config);
        } else if (method == 'post') {
            return $http.post(url, data, config);
        } else {
            //nothing;
        }
    }

    this.get = function(url, userCredentials, config) {
        if (userCredentials) setUser(userCredentials);
        return sendRequest('get', url, null, config);
    };

    this.post = function(url, data, userCredentials, config) {
        if (userCredentials) setUser(userCredentials);
        return sendRequest('post', url, data, config);
    };

});

appModule.service('LoginService', function($rootScope, authService, HttpClientService, AuthInfoService) {

    this.login = function(userCredentials, rememberCredentials, onSuccess) {
        rememberCredentials ? AuthInfoService.enableRemeberMe() : AuthInfoService.disableRemeberMe();

        sendChallenge(userCredentials, function() {
            authService.loginConfirmed();
            onSuccess();
        });
    };

    function sendChallenge(userCredentials, onResponse) {

        console.log('send challenge');
        HttpClientService.get('challengeServer/', userCredentials).success(onResponse);
    }

    this.logout = function() {
        authService.loginCancelled();
    };

});

appModule.service('UserService', function(HttpClientService, $q, LoginService) {

    this.user = null;

    this.logout = function() {
        this.user = null;
        LoginService.logout();
    };

    this.getUser = function() {
        var deferredUser = $q.defer();

        if (this.user == null) {

            var that = this;
            fetchUser(function (userPayload) {
                that.user = angular.fromJson(userPayload);
                deferredUser.resolve(that.user);
            });

        } else {
            deferredUser.resolve(this.user);
        }

        return deferredUser.promise;
    };

    function fetchUser(onSuccess) {
        console.log('fetchUser');

        HttpClientService.get('users/').success(function(payload) {
            if (onSuccess) {
                onSuccess(payload);
            }
        });
    }
});

appModule.service('ArticleService', function(HttpClientService, $q) {

    this.getArticles = function() {
        var deferArticles = $q.defer();

        HttpClientService.get('articles/').success(function(payload) {
            console.log("fetch articles");

            var articles = angular.fromJson(payload);
            deferArticles.resolve(articles);
        });

        return deferArticles.promise;
    };

    this.saveArticle = function(article) {
        var defer = $q.defer();

        this.verifyArticle(article,
            function(article) {
                HttpClientService.post('articles/', article).success(function (payload) {
                    var articles = angular.fromJson(payload);
                    defer.resolve(articles);
                });
            }, function(reason) {
                defer.reject(reason);
            });

        return defer.promise;
    };

    this.verifyArticle = function(article, onValidSuccess, onValidFailed) {
        if (article) {
            if (article.title && article.content) {
                onValidSuccess(article);
                return;
            }
        }
        onValidFailed("article title or content cannot be empty");
    };

});

appModule.controller('LoginCtrl', function($scope, $location, LoginService) {
    $scope.signupMode = false;
    $scope.loginRemember = false;
    $scope.user = {
        name: "",
        username: "",
        password: ""
    };

    $scope.logout = function() {
        LoginService.logout();
    };

    $scope.login = function() {
        console.log("submit login");
        console.log("username : " + $scope.user.username);

        LoginService.login($scope.user, $scope.loginRemember, function(response) {
                console.log("login succeed");
                $location.path("/");
            }
        );
    };
});

appModule.controller('EditorCtrl', function($scope, ArticleService) {
    $scope.articles = [];
    $scope.currentArticle = {
        id: "",
        title: "",
        content: "",
        keywords: [''],
        writerId: ""
    };

    $scope.editArticle = function(article) {
        $scope.currentArticle = article;
    };

    $scope.newArticle = function() {

        $scope.currentArticle = {
            id: "",
            title: "",
            content: "",
            keywords: [''],
            writerId: ""
        };
    };

    $scope.saveArticle = function() {
        ArticleService.saveArticle($scope.currentArticle).then(function(article) {
            $scope.newArticle();
            updateArticles();

        } ,function(failureReason) {
            alert(failureReason);
        });
    };

    function updateArticles() {
        ArticleService.getArticles().then(function(articles) {
            $scope.articles = articles;
        });
    }

    updateArticles();
});


appModule.controller('HomePageCtrl', function($scope, ArticleService) {

    ArticleService.getArticles().then(function(articles) {
        $scope.articles = articles;
    });

});

