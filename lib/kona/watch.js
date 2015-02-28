var debug = require('debug')('kona:watch');
var chokidar = require('chokidar');
var format = require('util').format;

/**
 * @extends Kona
 *
 * provides prototype methods for:
 *
 * - creating a chokidar file / directory
 *   watcher and running a callback on the `change` event.
 *
 * - watching the application routes.js file and all paths in `config.watch`
 *   and removing them from the require cache when they change.
 *
 * debugs to `kona:watch` channel
 *
 */
module.exports = {

  /**
   * setup a chokidar persistent watcher on a dir or file and call
   * the callback on `change` event
   *
   * @param  {String}   path directory (recursive) or file path to watch
   * @param  {Function} cb   callback to call on `change` event
   * @return {choikdar.watcher}        the watcher instance created
   */
  watch: function watch(path, cb) {
    debug('watching %s for changes', path);

    var options = {ignoreInitial: true, persistent: true},
        watcher = chokidar.watch(path, options);

    watcher.on('change', function(path, stat) {

      /* istanbul ignore next */
      debug(format("%s changed", path));

      /* istanbul ignore next */
      cb.call(this, path, stat);

    }.bind(this));

    return watcher;
  },


  /**
   * watches routes, controllers, models for changes and clears require cache
   * for those objects to be reloaded or clears routes and reloads them
   */
  watchModules: function watchModules(paths) {

    paths || (paths = []);

    // for all directories / files in `config.watch` array
    paths.forEach(function(watchPath) {

      // watch modules for changes
      this.watch(watchPath, function(eventPath, stat) {

        // delete from the warm cache, the next require will be fresh
        delete require.cache[eventPath];

      });

    }.bind(this));
  }

};