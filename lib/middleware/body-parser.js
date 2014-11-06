var bodyparser = require('koa-bodyparser');

module.exports = function(app) {
  app.use(bodyparser());
}