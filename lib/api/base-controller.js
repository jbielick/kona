var path = require('path');
var util = require('util');
var __extend = require('class-extend').extend;
var support = require(path.join(__dirname, '..', 'support'))
var _ = support.utilities;
var Params = support.Params;

/**
 * the super module of all controller modules in the application. All
 * controllers must inherit from this constructor.
 */
function BaseController(ctx) {
  // set default locals
  this.locals = ctx.locals = {
    // session: ctx.session,
    params: new Params(_.merge(
      ctx.router.match,
      ctx.request.body,
      ctx.request.query
    ))
  };

  // provide request params object to ctx.state and controller prop
  this.params = this.locals.params;

  // assign koa methods / properties
  _.assign(this,
    _.pick(ctx, [
      'accept',
      'cookies',
      'request',
      'response',
      'router',
      'throw'
    ])
  );
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
   * @type {Params} request params object
   */
  BaseController.prototype['call' + _.titleize(when) + 'Filters'] =
    function*(params) {
      var _this = this,
          filters = this['_' + when + 'Filters'];
      if (!filters) {return;}
      for (var i = filters.length - 1; i >= 0; i--) {
        yield this[filters[i]].call(_this, params);
      };
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
 * Uses negotiator and responds appropriates in order of the types
 * defined in the formatMap once it reaches one that the request accepts.
 * If no type is found that the request accepts, a 406 will be given.
 * @param {Object} formatMap an object map of format (shorthand) 'json, 'html'
 *                           with a value being the generator function to be
 *                           called to respond to the request.
 * @return {*} the result of the yield to controller respond generator or
 *                 the 406.
 */
BaseController.prototype.respondTo = function*(formatMap) {
  var _this = this,
      responder = null;
  if (!_.isPlainObject(formatMap)) {
    return this.throw(500, 'Argument given to #respondTo is not an object');
  }
  Object.keys(formatMap).some(function(format) {
    if (_this.request.accepts(format) && _.isFunction(formatMap[format])) {
      return (responder = formatMap[format]);
    } else {
      return false;
    }
  });
  if (responder) {
    return yield responder(this);
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
 * use the autoresponder's registered response mimes to infer the content-type
 * of the request and respond appropriately with the object provided.
 *
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
BaseController.prototype.respondWith = function(object) {
  // @TODO
};

/**
 * an extend 'class' method to create child / sub 'classes' of this conroller
 * that will inherit it's prototype and methods. allows for controller
 * inheritance within the application.
 * @param {Object} prototype an object that will be used at the prototype for
 *                           the child object inheriting from this one.
 */
BaseController.extend = __extend;

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