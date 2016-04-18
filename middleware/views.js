var path = require('path');
var views = require('koa-views');

module.exports = function(app) {
  // https://github.com/queckezz/koa-views
  // https://github.com/tj/co-views
  app.use(views(app.config.views, {
    'default': 'html',
    cache: app.env == 'development' ? false : 'memory',
    map: app.config.viewMap
  }));
}