var fs = require('fs');
var path = require('path');
var util = require('util');
var Params = require(path.join(__dirname, '..', 'support')).Params;

module.exports = function(app) {

  app.use(dispatcher(app.controllers));

  function dispatcher(controllers) {

    function* dispatcher(next) {

      var _this = this,
          params = this.router.match,
          controllerName,
          method,
          RequestController;

      if (!params) {
        // no route match, skip dispatch
        // @TODO no route matching error?
        this.throw(404, util.format("No route found matching %s", this.url));
        return yield next;
      } else {
        // dispatch the request
        controllerName = app._.toController(params.controller);

        // grab the controller for this request
        // RequestController = controllers @ mapping key ([namespace/]name)
        RequestController = controllers[params.controller];

        if (!RequestController) {
          return this.throw(util.format('Controller does not exist: %s', params.controller));
        } else {
          // instantiate the request controller
          this.controller = new RequestController(this);
        }

        // make sure we aren't hitting a private method
        if (this.controller[params.action] && params.action[0] === '_') {
          return this.throw(500,
            util.format("Cannot invoke private action %s#%s", controllerName, params.action)
          );
        }

        try {
          // yield to beforeFilter
          yield this.controller.callBeforeFilters(params);

          if (!app._.isFunction(this.controller[params.action])) {
            this.throw(500, util.format("Missing controller action: %s#%s",
              controllerName, params.action));
          } else {
            // yield to the action
            yield this.controller[params.action](params);
          }
          // yield to afterFilters
          yield this.controller.callAfterFilters(params);
        } catch(e) {
          throw e;
        }
        return yield next;
      }
    }

    return dispatcher;
  }

}