var path = require('path');
var views = require('koa-ejs');
var RenderHelper = require(path.join('..', 'helpers', 'render'));

module.exports = function(app) {

  var renderHelper = new RenderHelper(app);

  views(app.koa, {
    root: app.config.viewPath,
    layout: false,
    viewExt: app.config.viewExt,
    cache: app.env === 'production',
    debug: true,
    locals: {
      kona: app,
      render: renderHelper.render.bind(renderHelper),
      config: app.config
    },
    filters: {}
  });
}