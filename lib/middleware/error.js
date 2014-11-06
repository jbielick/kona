var error = require('koa-error-ejs');

module.exports = function(app) {
  app.use(error({
    view: 'errors/error',
    layout: 'layouts/application',
    custom: {
      403: 'errors/forbidden',
      404: 'errors/not-found',
      500: 'errors/internal'
    }
  }));
}