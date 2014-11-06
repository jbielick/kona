var logger = require('koa-logger');

module.exports = function(app) {
  app.use(logger());
}