var path = require('path');
var util = require('util');
var support = require(path.join(__dirname, 'support'));
var _ = support.Utilities;
var reflectAccessors = support.ReflectAccessors;
var delegates = require('delegates');


var RequestController = Controller.extend(
  _.extend({

    /**
     * @param {Context} ctx Koa.Context instance from the request
     */
    constructor: function(ctx) {

      Controller.apply(this, arguments);

      this._ctx = ctx;

      reflectAccessors(this, this.app, 'log');

      _.merge(
        this.locals,
        this.params,
        this.router.match,
        this.request.body,
        this.request.query
      );

      reflectAccessors(this.locals, this._ctx, ['session', 'cookies', 'params']);

    }

  },
  require(path.join(__dirname, 'controller', 'rendering'))
  )
);

_.extend(AbstractController.prototype,

);

_.extend(AbstractController.prototype,
  require(path.join(__dirname, 'controller', 'responders'))
);

_.extend(AbstractController.prototype,
  require(path.join(__dirname, 'controller', 'filters'))
);

/**
 * Statics
 */
_.extend(AbstractController,
  require(path.join(__dirname, 'controller', 'renderers'))
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

  AbstractController.addRenderer(type, function* (data) {
    return yield data;
  });

});


// setup proxies on prototype to ctx object prop
delegates(RequestController.prototype, 'ctx')
  .method('accepts')
  .method('redirect')
  .method('throw')
  .access('locals')
  .access('app')
  .access('body')
  .access('session')
  .access('cookies')
  .getter('router')
  .getter('request')
  .getter('response')


module.exports = RequestController;