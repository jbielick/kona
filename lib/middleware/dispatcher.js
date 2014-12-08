var fs = require('fs');
var path = require('path');
var format = require('util').format;

module.exports = function(app) {

  app.use(dispatcher());

  function dispatcher() {

    function* dispatcher(next) {

      var _this = this,
          params = this.router.match,
          Generator = function*(){}.constructor,
          ctrlNamespace,
          ctrlName,
          ctrlHumanName,
          RequestController;

      if (!params) {
        // no route match, skip dispatch
        this.throw(404, format("No route found matching %s", this.url));

        return;

      } else {

        // dispatch the request to it's destination controller
        ctrlNamespace = params.controller.split('/');
        ctrlName = ctrlNamespace.pop();
        ctrlHumanName = app._.toController(ctrlName);

        try {

          // require the controller for this request
          RequestController = require(app.root.join(
            'app',
            'controllers',
            path.join.apply(path, ctrlNamespace),
            ctrlName + '-controller'
          ));

        } catch (e) {
          if (['MODULE_NOT_FOUND'].indexOf(e.code) > -1) {
            // file didn't exist
            return this.throw(500, new Error(format("Missing controller: %s \n\t%s",
              params.controller,
              e.message
            )));

          } else {

            return yield this.throw(500, e);

          }
        }

        this.controller = new RequestController(this);

        // make sure we aren't hitting a private method
        if (this.controller[params.action] && params.action[0] === '_') {
          return yield this.throw(500,
            new Error(format("Cannot invoke private action %s#%s",
              ctrlHumanName, params.action))
          );
        }

        // yield to beforeFilter
        yield this.controller.callBeforeFilters(params);

        if (!app._.isFunction(this.controller[params.action])) {
          this.throw(500, new Error(format("Missing controller action: %s#%s",
            ctrlHumanName, params.action)));
        } else {
          if (this.controller[params.action] instanceof Generator) {
            // yield to the action
            yield this.controller[params.action].call(this.controller);
          } else {
            this.throw(500, new Error(format("Action %s#%s is not a generator!",
              ctrlHumanName, params.action)));
          }
        }

        // yield to afterFilters
        yield this.controller.callAfterFilters(params);

        return yield next;
      }
    }

    return dispatcher;
  }

}