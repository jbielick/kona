var path = require('path');
var util = require('util');
var support = require(path.join(__dirname, 'support'));
var _ = support.Utilities;
var reflectAccessors = support.ReflectAccessors;
var delegates = require('delegates');


/**
 * the super module of all controller modules in the application. All
 * controllers must extend this constructor.
 *
 * @param {Context} ctx Koa.Context instance from the request
 */
function AbstractController(ctx) {
  this.locals = {};
}

/*
 * Prototype
 */
_.extend(AbstractController.prototype, {

  /**
   * simply write the argument[0] to the response body
   * all template / advanced rendering is done in kona-rendering
   *
   * @param {Mixed} data          data to set to ctx.body
   * @param {String} options       options including type: 'content-type' to
   *                               to set to ctx.type
   */
  render: function* (data, options) {

    options || (options = {});

    if (options.type) {
      this.type = options.type;
    }

    this.body = data;
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
 *   var ApplicationController = kona.Controller.Base.extend({
 *     constructor: function() {
 *       kona.Controller.Base.apply(this, arguments);
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


module.exports = AbstractController;