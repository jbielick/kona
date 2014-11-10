var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var koa = require('koa');
var app = koa();

module.exports = function(app) {
  app.use(conditional());
  app.use(etag());
}