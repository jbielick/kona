var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var util = require('util');

module.exports = function(app) {

  app.use(dispatcher);

  function* dispatcher(next) {
    var _this, name, action, method, RequestController;

    if (!this.router.match) { return yield next; }

    _this = this;
    name = this.router.match.controller;
    action = this.router.match.action;
    method = this.router.match.method;

    // grab the controller for this request
    RequestController = require(path.join(app.appPath, 'controllers', name + '-controller'));
    // instantiate the request controller
    this.controller = new RequestController();

    // attach the route to the controller for params access
    this.controller.route = this.router.match;

    // assign koa properties / methods
    var koaProperties = [
      'app', 'accept', 'cookies', 'request', 'response', 'controller'
    ];
    _.assign(this.controller, _.pick(this, koaProperties));

    try {
      yield this.controller[action](app);
      this.router.match.dispatched = true;
    } catch(e) {
      throw e;
    }
    return yield next;
  }

}