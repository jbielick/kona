var path = require('path');
var Router = require('koa-barista');
var router = new Router
var fs = require('fs');
var routesFilePath = path.join(process.cwd(), 'config', 'routes');

if (fs.existsSync(routesFilePath)) {
  require(routesFilePath)(router); 
}

module.exports = function(app) {
  app.use(router.callback());
}