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

      // only need to take action after the stream comes back
      yield next;

      // if we're rendering nothing or it's a head request or the response body
      // has already been written (render has already been called)
      if (this.response.body || this.request.method === 'HEAD'
        || this.response.nothing) {

        return yield next;

      // else, we will respond
      } else if (this.controller) {
        // @TODO lookup contexts, 
        // extension inferences,
        // view helpers?
        // compilation?
        // caching is handled by koa-views
        return yield this.render(path.join(
          this.router.match.controller,
          this.router.match.action
        ), this.locals);
      }
    }
  }
}