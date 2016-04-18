var support = require('./support');
var debug = require('debug')('kona:request-controller');
var format = require('util').format;
var _ = support.Utilities;
var reflectAccessors = support.ReflectAccessors;
var delegates = require('delegates');
var Controller = require('./controller');

var RequestController = Controller.extend({

  /**
   * @param {Context} ctx Koa.Context instance from the request
   */
  constructor: function(ctx) {

    Controller.apply(this, arguments);

    this.ctx = ctx;

    reflectAccessors(this, ctx.app, 'log');

    this.params = ctx.params = _.extend(
      {},
      this.request.body,
      this.request.query
    );

    _.extend(ctx.state, {
      session: ctx.session,
      cookies: ctx.cookies,
      params: ctx.params,
      cache: ctx.cache,
      router: ctx.app.router
    });

    // this.locals is an object created by the super class, but in this
    // case, ctx.state is the object with which we want to share vars with
    // our views
    this.locals = ctx.state;
  }

});

_.extend(RequestController.prototype,
  require('./controller/responders'),
  require('./controller/rendering')
);

// add default renderers which are all handled by koa and require
// no special operations before being served to koa
[
  'json',
  'stream',
  'buffer',
  'text',
  'html',
  'default'
].forEach(function(type) {

  RequestController.addRenderer(type, function* (data) {
    return yield data;
  });

});


// setup proxies on prototype to ctx object prop
delegates(RequestController.prototype, 'ctx')
  .method('accepts')
  .method('redirect')
  .method('throw')
  .access('app')
  .access('body')
  .access('session')
  .access('cache')
  .access('cookies')
  .getter('router')
  .getter('request')
  .getter('response')


module.exports = RequestController;