var compose = require('koa-compose');
var path = require('path');
var serve = require('koa-static');
var favicon = require('koa-favicon');

// function* interceptAssetRequest(next) {
//   if (!/^\/assets\//i.test(this.request.path)) {
//     return yield next;
//   }
//   this.request.path = this.request.path.replace(/^\/assets\//i, '/');
//   console.log(this.request.path);
// }

module.exports = function(app) {
  var statics = [];
  statics.push(serve(app.config.publicPath));
  // statics.push(interceptAssetRequest);
  app.config.assetPaths.forEach(function(path) {
    statics.push(serve(path));
  });
  statics.push(favicon(path.join(app.config.publicPath, 'favicon.ico')));
  app.use(compose(statics));
}