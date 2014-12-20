var path = require('path');
var util = require('util');
var support = require(path.join(__dirname, '..', 'support'));
var _ = support.Utilities;
var reflectAccessors = support.ReflectAccessors;
var delegates = require('delegates');


/**
 * the super module of all controller modules in the application. All
 * controllers must extend this constructor.
 */
function BaseController(ctx) {

  this.ctx = ctx;
  this.app = ctx.app;

  reflectAccessors(this, this.ctx.app, 'log');

  // provide request params object to ctx.state and controller prop
  ctx.params = this.params = _.merge(
    {},
    this.router.match,
    this.request.body,
    this.request.query
  );

  // hold a reference to ctx.locals object
  this.locals = ctx.locals;

  // make some proxy ctx getters/setters on locals
  reflectAccessors(this.locals, ctx, [
    'session',
    'cookies',
    'params'
  ]);

}


/**
 * prototype extensions
 */
_.extend(BaseController.prototype, require('./extensions/rendering'));
_.extend(BaseController.prototype, require('./extensions/responders'));
_.extend(BaseController.prototype, require('./extensions/filters'));

/**
 * Static extensions
 */
_.extend(BaseController, require('./extensions/renderers'));


// add default renderers
// handled by koa
BaseController.addRenderer('json', function* (data) {
  return yield data;
});

// handled by koa
BaseController.addRenderer('stream', function* (stream) {
  return yield stream;
});

// handled by koa
BaseController.addRenderer('buffer', function* (buffer) {
  return yield buffer;
});

// handled by koa
BaseController.addRenderer('text', function* (string) {
  return yield string;
});

// plain html
BaseController.addRenderer('html', function* (html) {
  return yield html;
});

// templates
BaseController.addRenderer('template', function* (path) {
  return yield this.ctx.render(path);
});


/**
 * an extend 'class' method to create child / sub 'classes' of this conroller
 * that will inherit it's prototype and methods. allows for controller
 * inheritance within the application.
 *
 * example:
 *
 * ```
 *   var ApplicationController = kona.Controller.Base.extend({
 *     constructor: function() {
 *       kona.Controller.Base.apply(this, arguments);
 *       this.beforeFilter('authenticate');
 *     }
 *   })
 *
 *
 * @param {Object} prototype an object that will be used at the prototype for
 *                           the child object inheriting from this one.
 */
BaseController.extend = require('class-extend').extend;


/**
 * a slightly more classical way to extend this controller. uses util.inehrits
 * to rebase the given constructor on `this` prototype without calling
 * constrcutor functions. Beware, it modifies the given constructor in-place.
 * @param  {Function} constructor the constructor to inherit from this
 * @return {Function}             the constructor that inherits from this.
 */
BaseController.rebase = _.partialRight(util.inherits, BaseController);


// setup proxies on prototype to ctx object prop
delegates(BaseController.prototype, 'ctx')
  .method('accepts')
  .method('redirect')
  .method('throw')
  .access('body')
  .access('session')
  .access('cookies')
  .getter('router')
  .getter('request')
  .getter('response')


// metal
_.extend(BaseController.prototype, {

  /**
   * set a variable (or variables) to the locals that will be provided to the
   * view.
   * @param {Object|String} objectOrKey an object of variable name => value map
   *                                    or a string that will be the variable name
   *                                    in the view.
   * @param {*} value       the value to store as the named variable [optional]
   */
  set: function(objectOrKey, value) {

    if (_.isPlainObject(objectOrKey)) {

      _.assign(this.locals, objectOrKey);

    } else if (_.isString(objectOrKey) && !_.isUndefined(value)) {

      this.locals[objectOrKey] = value;

    }
  }

});

module.exports = BaseController;