var responseTime = require('koa-response-time');

module.exports = function(app) {
  app.use(responseTime());
}