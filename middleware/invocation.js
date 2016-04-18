var path = require('path');
var debug = require('debug')('kona:invocation');
var format = require('util').format;
var assert = require('assert');
var _Generator = (function* () {}).constructor;

module.exports = function (app) {

  app.use(invocation());

  function invocation () {

    return function* (next) {

      if (!this.controller) { return yield next; }

      var controller = this.controller.name,
          action = this.router.match.action;

      // action is present in controller
      assert(action in this.controller, format(
        'Missing/invalid controller action: %s#%s',
        controller,
        action
      ));

      // action is not a generator
      assert(this.controller[action] instanceof _Generator, format(
        'Controller Action %s#%s is not a generator function!',
        controller,
        action
      ));

      // method is not private
      assert(/^[^_].*/.test(action), format(
        'Cannot invoke private/hidden action %s#%s',
        controller,
        action
      ));

      debug(format('%s %s#%s (%s)',
        this.request.method,
        controller,
        action,
        this.request.accepts()[0]
      ));

      // yield to beforeFilters
      yield this.controller.beforeFilters();

      // yield to action
      yield this.controller[action].call(this.controller);

      // yield to afterFilters
      yield this.controller.afterFilters();

      // continue downstream, no upstream necessary
      return yield next;

    }

  }

};
