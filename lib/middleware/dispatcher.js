var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var util = require('util');

module.exports = function(app) {

  app.use(dispatcher(app.controllers));

  function dispatcher (controllers) {

    function* dispatcher (next) {
      if (!this.router.match) { 
        // no route match, skip dispatch
        return yield next; 
      } else {
        // dispatch the request
        return yield dispatch.call(this, this.router.match, controllers);
      }

      function* dispatch(params, controllers) {
        var _this, name, action, method, RequestController;

        // grab the controller for this request
        // RequestController = controllers @ mapping key ([namespace/]name)
        RequestController = controllers[params.controller];

        if (!RequestController) {
          return this.throw('Controller does not exist %s', params.controller);
        } else {
          // instantiate the request controller
          this.controller = new RequestController(this.request);
        }
        // set default locals
        this.locals = {
          kona: _.pick(app, 'version', 'env', 'config'),
          session: this.session
        };
        // assign koa methods / properties
        _.assign(this.controller, 
          _.pick(this, [
            'app', 
            'accept', 
            'cookies', 
            'request', 
            'response', 
            'router'
          ])
        );
        this.controller.session = this.session;
        this.controller._render = this.render;

        // make sure we aren't hitting a private method
        if (this.controller[params.action] && params.action[0] === '_') {
          return this.throw(500, 
            util.format("Cannot invoke private action: %s", params.action)
          );
        }

        try {
          // yield to beforeFilter
          yield this.controller.beforeFilter(params);
          // return the yield to the action
          return yield this.controller[params.action](params);
        } catch(e) {
          throw e;
        }
      };
    }

    return dispatcher;
  }

}