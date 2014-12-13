var path = require('path');
var util = require('util');
var support = require(path.join(__dirname, '..', 'support'))
var _ = support.Utilities;
var Traversable = support.Traversable;
var reflectAccessors = support.ReflectAccessors;

/**
 * the super module of all controller modules in the application. All
 * controllers must extend this constructor.
 */
function BaseController(ctx) {

  reflectAccessors(this, ctx, [
    'accepts',
    'body',
    'session',
    'cookies',
    'request',
    'response',
    'router',
    'throw'
  ]);

  // reflectAccessors(this, ctx.app, 'log');

  // provide request params object to ctx.state and controller prop
  ctx.params = this.params = _.merge(
    {},
    ctx.router.match,
    ctx.request.body,
    ctx.request.query
  );

  this.locals = ctx.locals;

  reflectAccessors(this.locals, ctx, ['session', 'cookies', 'params']);

};

['before', 'after'].forEach(function(when) {

  /**
   * register a {before|after}Filter
   * @param {Array|String} the name of the prototype method(s) on the
   *                           the controller
   */
  BaseController.prototype[when + 'Filter'] = function() {
    var prop = '_' + when + 'Filters',
        methods = [].slice.call(arguments);
    this[prop] = (this[prop] || (this[prop] = [])).concat(methods);
  };

  /**
   * calls all registered {after|before}Filters
   */
  BaseController.prototype['call' + _.titleize(when) + 'Filters'] =
    function*() {
      var _this = this,
          filters = this['_' + when + 'Filters'];
      if (!filters) { return; }
      for (var i = filters.length - 1; i >= 0; i--) {
        yield this[filters[i]].call(_this);
      };
      return true;
    };

});

/**
 * set a variable (or variables) to the locals that will be provided to the
 * view.
 * @param {Object|String} objectOrKey an object of variable name => value map
 *                                    or a string that will be the variable name
 *                                    in the view.
 * @param {*} value       the value to store as the named variable [optional]
 */
BaseController.prototype.set = function(objectOrKey, value) {
  if (_.isPlainObject(objectOrKey)) {
    _.assign(this.locals, objectOrKey);
  } else if (_.isString(objectOrKey) && !_.isUndefined(value)) {
    this.locals[objectOrKey] = value;
  }
};

/**
 * given a map of format => generator func, will call the correct
 * generator function according to the accepts type of the request.
 * Uses negotiator and responds in order of the types defined in the formatMap
 * object once it reaches one that the request accepts.
 * If no type is found that the request accepts, a 406 is thrown.
 * @param {Object} formatMap an object map of format (shorthand) 'json', 'html'
 *                           with a value being the generator function to be
 *                           called to respond to the request.
 * @return {*} the result of the yield to controller respond generator or
 *                 the 406.
 */
BaseController.prototype.respondTo = function*(formatMap) {
  var _this = this,
      responder = null,
      responderFormats,
      acceptable;

  if (!_.isPlainObject(formatMap)) {
    return this.throw(500, 'Argument given to #respondTo is not an object');
  }
  responderFormats = Object.keys(formatMap);
  acceptable = _this.request.accepts(responderFormats);

  if (acceptable && _.isFunction(formatMap[acceptable])) {
    this.responder = formatMap[acceptable];
    this.format = acceptable;
    return yield this.responder.call(this);
  } else {
    return this.throw(406);
  }
};

/**
 * register the format / types this controller responds to when response
 * is delegated to the autoresponder
 *
 * @return {String} mime short-type ex. 'json', 'html'
 */
BaseController.prototype.respondsTo = function() {
  var types = [].slice.call(arguments);
  this._respondsTo || (this._respondsTo = []);
  this._respondsTo = this._respondsTo.concat(types);
  return true;
};

/**
 * the render method in controller context.
 * accepts a simple String template name or an object or render instructions.
 * Options include:
 *
 *  template: 'path/to/template' -- extension necessary if not default viewExt\
 *  view: 'path/to/template'  -- (same as above)
 *  format: 'js'    -- let the autoresponder render the template, but only in this
 *                      format (file extension)
 *  nothing: true   -- respond with an empty body
 *
 * @param {Object|String} template path / name or {}
 */
BaseController.prototype.render = function() {
  if (_.isUndefined(this._render)) {
    this._render = [].slice.call(arguments);
    return true;
  } else {
    return this.throw(500, 'Render and / or redirect called multiple times');
  }
};

BaseController.prototype.redirect = function() {
  // @TODO - probably just proxy koa.redirect
};

/**
 * use the autoresponder's registered respondsTo mimes to negotiate contenttype
 * of the request and respond appropriately with the object provided.
 *
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
BaseController.prototype.respondWith = function*(object) {
  var responders = {};
  this._respondsTo.forEach(function(type) {
    if (type === 'html') {
      // view will be rendered by autoresponder
      responders[type] = function*() {}
    } else {
      responders[type] = function*() {
        // @TODO use getRendererFor and register rederers for these types.
        var options = {};
        options[type] = object;
        this.render(options);
      }
    }
  });
  yield this.respondTo(responders);
  return responders;
};

/**
 * an extend 'class' method to create child / sub 'classes' of this conroller
 * that will inherit it's prototype and methods. allows for controller
 * inheritance within the application.
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
BaseController.rebase = function(constructor) {
  util.inherits(constructor, this);
  return constructor;
}

module.exports = BaseController;