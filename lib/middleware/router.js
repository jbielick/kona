var path = require('path');
var Router = require('koa-barista');
var router = new Router

require(path.join(process.cwd(), 'config', 'routes'))(router);

module.exports = function(app) {
  app.use(router.callback());
}