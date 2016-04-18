var debug = require('debug')('kona:mixins');
var util = require('util');
var format = util.format;
var fs = require('fs');
var path = require('path');

module.exports = {
  /**
   * @extends Kona
   *
   * Searches local (app) `node_modules/` for modules matching `kona-*`
   * (mixin modules), attempts to require them and call their
   * exported `.required` method as a callback.
   *
   * Inside the required callback, the module must then attach any hook event
   * listeners that will be yielded to when a hook is fired. The events
   * registered as hooks must be be namespaced with `hooks:` followed by the
   * name of the hook. The handler for these event listeners must be
   * generator function as the application will yield flow to these hooks.
   *
   * The context of the handler will be the kona app instance.
   *
   * A kona mixin module may look like this:
   *
   *
   * var client;
   * ...
   *
   * module.exports = {
   *
   *    required: function (app) {
   *
   *      // registers an event listener on the initialize hook
   *      // when the `initialize` hook is fired, the application will yield
   *      // to this handler
   *      app
   *        .on('hook:initialize', this.initialize)
   *        .on('hook:configure', this.configure)
   *        .on('hook:shutdown', this.shutdown);
   *
   *    },
   *
   *    initialize: function* () {
   *      client.on('error', this.onerror);
   *      this.redis = client;
   *      delegate(this.Controller.Abstract.prototype, 'app').access('redis')
   *    },
   *
   *    configure: function* () {
   *      client = redis.createClient(this.config.redis || {});
   *    },
   *
   *    shutdown: function* () {
   *      client.end();
   *    }
   *
   * };
   *
   */
  loadMixins: function (manifestPath) {

    var manifest = JSON.parse(fs.readFileSync(manifestPath));

    return Object.keys(manifest.dependencies).filter(function(name) {
      if (!/^kona\-/.test(name)) return false;

      debug(format('requiring mixin: %s@%s', name, manifest.dependencies[name]));

      this.requireMixin(name);

      return true;
    }, this);

  },

  requireMixin: function (moduleName) {
    // require the module
    var mixin = require(moduleName);

    (mixin.required || mixin)(this);

  }

};