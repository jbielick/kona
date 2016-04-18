var xRequestId = require('koa-x-request-id');

/**
 * attaches request id to the request context
 * @param  {Application} app kona app instance
 */
module.exports = function(app) {
  app.use(xRequestId(app, {inject: true}));
}
