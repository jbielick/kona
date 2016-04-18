var methodOverride = require('koa-methodoverride');

module.exports = function(app) {
  app.use(methodOverride('_method'));
}