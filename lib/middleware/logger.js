var logger = require('koa-logger');

// https://github.com/koajs/logger
module.exports = function(app) {
  app.use(logger());
}