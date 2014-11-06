var path = require('path');
var _ = require('lodash');
var util = require('util');
var fs = require('co-fs');

module.exports = function(app) {

  app.use(autoresponder);

  /**
   * automatically generates a response based on the controller / action
   * and the content-type of the request
   */
  function* autoresponder(next) {
    var options = {}, layoutName, realPath, exists;

    // only need to take action after the stream comes back
    yield next;

    // if we're rendering nothing or it's a head request or the response body
    // has already been written (render has already been called)
    if (this.response.body || this.request.method === 'HEAD' 
      || this.response.nothing) {
      return yield next;
    // else, we need to autorespond
    } else if (this.router.match.dispatched) {
      // if a layout has been set for this controller
      layoutName = _.result(this.controller, 'layout');
      if (layoutName) {
        options.layout = path.join('layouts', layoutName);
        realPath = path.join(app.config.viewPath, 
          options.layout + '.' + app.config.viewExt);
        exists = yield fs.exists(realPath);
        if (!exists) {
          throw new Error(util.format('Cannot find layout: %s', realPath));
        }
      }
      return yield this.render(path.join(
        this.router.match.controller,
        this.router.match.action
      ), options);
    }
  }
}