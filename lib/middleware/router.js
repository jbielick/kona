var path = require('path');
var Router = require('koa-barista');
var router = new Router();
var fs = require('co-fs');

module.exports = function(app) {
  var routesFilePath = app.root.join('config', 'routes');
  if (fs.exists(routesFilePath + '.js')) {
    require(routesFilePath)(router);
  }
  app.use(router.callback());
}