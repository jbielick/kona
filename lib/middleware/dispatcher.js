var path = require('path');
var debug = require('debug')('kona:dispatcher');
var format = require('util').format;
var assert = require('assert');
var RequestController = require('../controller/request');
var _Generator = (function*() {}).constructor;

module.exports = function (app) {

  app.use(dispatcher());

  function dispatcher() {

    return function* (next) {

      var match = this.router.match,
          ctrlNamespace,
          ctrlName,
          ctrlFolder,
          ctrlHumanName,
          ctrlPath,
          Controller;

      // no route match, skip dispatch
      if (!match) {
        return this.throw(404, format('No route found matching %s', this.url));
      }

      ctrlFolder = path.join('app', 'controllers');
      ctrlNamespace = match.controller.split('/');
      ctrlName = ctrlNamespace.pop();
      ctrlHumanName = app._.toController(ctrlName);

      ctrlPath = app.root.join(
        ctrlFolder,
        path.join.apply(path, ctrlNamespace),
        ctrlName + '-controller'
      );

      // require the controller for this request
      // objects will be in the require cache after their
      // first require in development, but in production, all objects
      // are required during bootstrap so the cache is pre-warmed and
      // the require here will come straight from the cache.
      Controller = require(ctrlPath);

      // construct a new controller instance for the request
      this.controller = new Controller(this);

      // action is present in controller
      assert(match.action in this.controller, format(
        'Missing/invalid controller action: %s#%s',
        ctrlHumanName,
        match.action
      ));

      // controller module inherits from kona request controller
      assert(this.controller instanceof RequestController, format(
        '%s does not inherit from RequestController',
        this.controller
      ));

      // action is not a generator
      assert(this.controller[match.action] instanceof _Generator, format(
        'Controller Action %s#%s is not a generator function!',
        ctrlHumanName,
        match.action
      ));

      // method is not private
      assert(/^[^_].*/.test(match.action), format(
        'Cannot invoke private/hidden action %s#%s',
        ctrlHumanName,
        match.action
      ));

      debug(format('%s %s#%s (%s)',
        this.request.method,
        ctrlHumanName,
        match.action,
        this.request.accepts()[0]
      ));

      // yield to beforeFilters
      yield this.controller.beforeFilters();

      // yield to action
      yield this.controller[match.action].call(this.controller);

      // yield to afterFilters
      yield this.controller.afterFilters();

      // continue
      return yield next;

    };
  }

};