var debug = require('debug')('kona:hooks');
var path = require('path');
var fs = require('fs');
var format = require('util').format;
var co = require('co');

/**
 * @extends Kona
 *
 * provides prototype methods to load application hooks.
 *
 * searches local `node_modules/` for modules matching `kona-*`
 * and attempts to require them and call their initialize / bootstrap / config
 * functions to attach behavior / functionality / modules to the kona module
 *
 * debugs to `kona:hooks` channel
 */
module.exports = {

  /**
   * walks the local `node_modules` directory searching for `kona-*` named
   * modules and adds their exports to a hooks array which will be used
   * later to attempt to call hook methods on those exports at the appropriate
   * time.
   */
  loadHooks: function* () {

    if (!fs.existsSync(this.root.join('node_modules'))) {
      return;
    }

    var hooks = this.hooks = this.hooks || {},
        requireMatch;

    requireMatch = function (module) {

      var modulePath = this.root.join('node_modules', module);

      if (/^kona\-.*/.test(module) && fs.statSync(modulePath).isDirectory()) {

        debug(format('requiring mixin: %s', module));

        hooks[module] = require(modulePath);
      }

    }.bind(this);

    fs.readdirSync(this.root.join('node_modules')).forEach(requireMatch);

    yield this.hook('loaded');

    return hooks;
  },

  /**
   * calls the {hook} method on all hook modules if it responds to it
   * @param  {String} hookName the name of the hook to fire
   */
  hook: function* (hookName) {
    var hooks = [];

    Object.keys(this.hooks).forEach(function(moduleName) {
      if (hookName in this.hooks[moduleName]) {
        hooks.push(this.hooks[moduleName][hookName]);
      }
    }.bind(this));

    return yield hooks;
  }

};