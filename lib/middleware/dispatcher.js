var fs = require('fs');
var path = require('path');
var debug = require('debug')('kona:dispatcher');
var format = require('util').format;

module.exports = function(app) {

  app.use(dispatcher());

  function dispatcher() {

    function* dispatcher(next) {

      var _this = this,
          params = this.router.match,
          Generator = (function*() {}).constructor,
          ctrlNamespace,
          ctrlName,
          ctrlFolder,
          ctrlHumanName,
          ctrlPath,
          RequestController;

      // no route match, skip dispatch
      if (!params) {

        return this.throw(404, format("No route found matching %s", this.url));

      // dispatch the request to it's destination controller
      } else {

        ctrlFolder = path.join('app', 'controllers');
        ctrlNamespace = params.controller.split('/');
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
        RequestController = require(ctrlPath);

        this.controller = new RequestController(this);

        // yield to beforeFilters
        yield this.controller.callBeforeFilters(params);

        // action exists
        if (!(params.action in this.controller)) {

          return this.throw(500, new Error(format(
            "Missing/invalid controller action: %s#%s",
            ctrlHumanName,
            params.action
          )));

        // controller module does not inherit from kona controller/base
        } else if (!this.controller instanceof kona.Controller.Base) {

          return this.throw(500, new Error(format(
            "%s does not inherit from Kona.Controller.Base",
            this.controller
          )));

        // action is not a generator - fail.
        } else if (!this.controller[params.action] instanceof Generator) {

          return this.throw(500, new Error(format(
            "Controller Action %s#%s is not a generator function!",
            ctrlHumanName,
            params.action
          )));

        // make sure we aren't hitting a private method
        } else if (params.action[0] === '_' /* || this.controller.isActionAllowed(params.action) */) {

          return this.throw(500, new Error(format(
            "Cannot invoke private/hidden action %s#%s",
            ctrlHumanName,
            params.action
          )));

        // everything looks okay
        } else {

          debug(format('%s %s#%s (%s)', this.request.method,
            ctrlHumanName, params.action, this.request.accepts()[0]));

          yield this.controller[params.action].call(this.controller);

        }

        // yield to afterFilters
        yield this.controller.callAfterFilters(params);

        // continue
        return yield next;
      }
    }

    return dispatcher;
  }

}