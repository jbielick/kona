var path = require('path');
var Router = require('koa-barista');
var debug = require('debug')('kona:routes');

module.exports = function(app) {
  var routesFilePath = app.root.join('config', 'routes');

  app.router = new Router();

  if (app.inApp) {

    app.on('routes:reload', function() {
      debug('routes loaded');
      // clear routes
      if (app.router.routes.length > 0) {
        app.router.routes = [];
      }
      // interestingly, the request match resides on the global object and
      // overshadows the prototype method for #match
      if (app.router.match) {
        delete app.router.match;
      }
      // drawRoutes
      require(routesFilePath)(app.router);
    });

    // kick it off
    app.emit('routes:reload');
  }

  app.use(app.router.callback());
}