var path = require('path');
var _ = require('lodash');
var util = require('util');
var format = util.format;
var fs = require('co-fs');

module.exports = function(app) {

  app.use(autoresponder());

  function autoresponder(options) {
    /**
     * automatically generates a response based on the controller / action
     * and the content-type of the request
     */
    return function* autoresponder(next) {
      var looked = [], dirs, folder, fullPath, template, depth;

      // only need to take action when request comes back upstream
      yield next;

      // if we're rendering nothing or it's a head request or the response body
      // has already been written (render has already been called)
      if (this.response.body || this.request.method === 'HEAD'
        || this.response.nothing) {

        return yield next;

      // else, we will respond if a controller is mounted for the request
      } else if (app._.isObject(this.controller)) {

        // caching is handled by koa-views
        template = this.router.match.action;
        dirs = this.router.match.controller.split('/');
        folder = dirs.join(path.sep);
        depth = dirs.length;

        while (depth > 0) {
          looked.push(folder);
          try {
            return yield this.render(path.join(folder, template), this.locals);
          } catch (e) {
            if (!e.code || !(e.code.match(/ENOENT/) && e.message.match(/open/))) {
              throw e;
            }
            if (depth > 1) {
              depth--;
              dirs.pop();
              folder = dirs.join(path.sep);
              continue;
            } else {
              return this.throw(404, new Error(format(
                "Missing template: %s \nSearched in %s",
                template,
                JSON.stringify(looked, null, 2)
              )));
            }
          }
        }
      }
    }
  }
}