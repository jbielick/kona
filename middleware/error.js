var path = require('path');
var error = require('koa-error');

module.exports = function(app) {
  var options = {};
  if (app.inApp) {
    options.template = path.join(app.config.views, 'errors/error.html');
  }
  app.use(error(options));
}