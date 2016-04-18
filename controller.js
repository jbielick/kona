var util = require('util');
var support = require('./support');
var _ = support.Utilities;


/**
 * the super module of all controller modules in the application. All
 * controllers must extend this constructor.
 *
 * @param {Context} ctx Koa.Context instance from the request
 */
function Controller() {
  this.locals = {};
}

/*
 * Prototype
 */
_.extend(Controller.prototype,
  require('./controller/filters'),
  require('./controller/rendering')
);

_.extend(Controller.prototype, {
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
 *   var Controller = require('kona/controller');
 *
 *   var ApplicationController = Controller.extend({
 *     constructor: function() {
 *       Controller.apply(this, arguments);
 *       this.beforeFilter('authenticate');
 *     }
 *   })
 *
 * ```
 *
 * @param {Object} prototype an object that will be used at the prototype for
 *                           the child object inheriting from this one.
 */
Controller.extend = require('class-extend').extend;


/**
 * Statics
 */
_.extend(
  Controller,
  require('./controller/renderers'),
  require('./controller/invocation')
);


module.exports = Controller;