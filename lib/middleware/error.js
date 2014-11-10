var path = require('path');
var error = require('koa-error');

module.exports = function(app) {
  app.use(error({
    template: path.join(app.config.views, 'errors/error.html')
  }));
}