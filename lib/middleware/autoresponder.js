var path = require('path');
var _ = require('lodash');
var util = require('util');
var fs = require('co-fs');

module.exports = function(app) {

  app.use(autoresponder());

  function autoresponder(options) {
    /**
     * automatically generates a response based on the controller / action
     * and the content-type of the request
     */
    return function* autoresponder(next) {
      var pathParts;

      // only need to take action when request comes back upstream
      yield next;

      // if we're rendering nothing or it's a head request or the response body
      // has already been written (render has already been called)
      if (this.response.body || this.request.method === 'HEAD'
        || this.response.nothing) {

        return yield next;

      // else, we will respond if a controller is mounted for the request
      } else if (app._.isObject(this.controller)) {

        // @TODO lookup contexts, extension inferences
        // caching is handled by koa-views
        pathParts = this.router.match.controller.split('/');
        pathParts.push(this.router.match.action);
        return yield this.render(path.join.apply(path, pathParts), this.locals);
      }
    }
  }
}