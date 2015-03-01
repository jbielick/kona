var path = require('path');
var util = require('util');
var support = require('../support');
var _ = support.Utilities;
var reflectAccessors = support.ReflectAccessors;
var delegates = require('delegates');


/**
 * the super module of all controller modules in the application. All
 * controllers must extend this constructor.
 *
 * @param {Context} ctx Koa.Context instance from the request
 */
function AbstractController() {
  this.locals = {};
}

/*
 * Prototype
 */
_.extend(AbstractController.prototype,
  require('./filters'),
  require('./rendering')
);
_.extend(AbstractController.prototype, {
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

/**
 * an extend 'class' method to create child / sub 'classes' of this conroller
 * that will inherit it's prototype and methods. allows for controller
 * inheritance within the application.
 *
 * example:
 *
 * ```
 *   var ApplicationController = kona.Controller.Abstract.extend({
 *     constructor: function() {
 *       kona.Controller.Abstract.apply(this, arguments);
 *       this.beforeFilter('authenticate');
 *     }
 *   })
 *
 * ```
 *
 * @param {Object} prototype an object that will be used at the prototype for
 *                           the child object inheriting from this one.
 */
AbstractController.extend = require('class-extend').extend;


/**
 * a slightly more classical way to extend this controller. uses util.inehrits
 * to rebase the given constructor on `this` prototype without calling
 * constrcutor functions. Beware, it modifies the given constructor in-place.
 *
 * @param  {Function} constructor the constructor to inherit from this
 * @return {Function}             the constructor that inherits from this.
 */
AbstractController.rebase = _.partialRight(util.inherits, AbstractController);


/**
 * Statics
 */
_.extend(AbstractController, require('./renderers'));


module.exports = AbstractController;