
module.exports.setupRoutes = function(app) {
    console.log("init routes");

    require('./main').mainRouteSetup(app);
    require('./users').userRouteSetup(app);
    require('./articles').articleRouteSetup(app);
};
