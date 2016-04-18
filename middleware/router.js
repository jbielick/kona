var path = require('path');
var fs = require('fs');
var router = require('koa-router')();
var debug = require('debug')('kona:router');

module.exports = function(app) {
  var routesFilePath = app.root.join('app', 'routes.js');

  if (fs.existsSync(routesFilePath)) {
    // load all routes from app dir
    require(routesFilePath)(router);
    debug('routes loaded');
  }

  // for url-building
  app.router = router;

  app
    .use(router.routes())
    .use(router.allowedMethods());
}