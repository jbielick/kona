var path = require('path');
var debug = require('debug')('kona:invocation');
var format = require('util').format;
var assert = require('assert');
var _Generator = (function* () {}).constructor;

module.exports = {

  invoke: function* invokeAction(actionName, ctx) {

    var controller = Object.create(this.prototype);

    // actionName is present in controller
    assert(actionName in controller, format(
      'Missing/invalid action: %s#%s',
      controller,
      actionName
    ));

    // actionName is not a generator
    assert(controller[actionName] instanceof _Generator, format(
      'Action %s#%s is not a generator function!',
      controller,
      actionName
    ));

    // action is not private
    assert(/^[^_].*/.test(actionName), format(
      'Cannot invoke private/hidden action %s#%s',
      controller,
      actionName
    ));

    controller.action = actionName;
    controller.controller = controller.name;
    controller.constructor(ctx);

    // yield to beforeFilters
    yield controller.beforeFilters();

    // yield to action
    yield controller[actionName]();

    // yield to afterFilters
    yield controller.afterFilters();
  }

};