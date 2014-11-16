var path = require('path');
var util = require('util');
var __extend = require('class-extend').extend;
var _ = require('lodash');

/**
 * the super module of all controller modules in the application. All 
 * controllers must inherit from this constructor.
 */
function BaseController() {};

/**
 * noop at the moment
 * @param {Object} params the router match / params
 */
BaseController.prototype.beforeFilter = function* (params) {};

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
BaseController.prototype.respondTo = function* (formatMap) {
  var _this = this,
      responder = null;
  Object.keys(formatMap).some(function(format) {
    if (!_.isFunction(formatMap[format])) {
      return false;
    } else if (_this.request.accepts(format)) {
      return responder = formatMap[format];
    } else {
      return false;
    }
  });
  if (responder) {
    return yield responder.call(this);
  } else {
    return this.throw(406);
  }
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
 * @param {Object|String} template path / name or  {}
 */ 
BaseController.prototype.render = function* () {
  var args = [].slice.call(arguments),
      options;
  if (args.length === 1) {
    template = args[0];
    if (template === false) {
      this.response.nothing = true;
      return;
    } else {
      yield this._render(template, this.locals);
    }
  } else {
    if (_.isPlainObject(args[0])) {
      options = args[0];
      yield this._render((options.template || options.view), this.locals);
    } else {
      return this.throw(500, 'Invalid Object given to #render');
    }
  }
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