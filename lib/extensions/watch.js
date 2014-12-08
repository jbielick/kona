var debug = require('debug')('kona:watch');
var chokidar = require('chokidar');
var format = require('util').format;

/**
 * @extends Kona
 *
 * watches a directory recursively using chokidar,
 * calls the provided callback when a change is detected.
 *
 * debugs to `kona:watch` channel
 *
 * @param  {String}   path  path to folder or file to watch (recursive)
 * @param  {Function} cb   onChange callback
 */
module.exports.watch = function watch(path, cb) {
  debug('watching %s for changes', path);

  return chokidar.watch(path, {
    ignoreInitial: true,
    persistent: true
  }).on('change', function(path, stat) {

    debug(format("%s changed", path));
    cb(path, stat);

  });
};