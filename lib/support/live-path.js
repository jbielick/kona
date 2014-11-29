var path = require('path');

module.exports = function LivePath(_path) {
  this.toString = this.valueOf = function() { return _path; };
  this.join = function() {
    var args = [].slice.call(arguments);
    args.unshift(_path);
    return path.join.apply(path, args);
  }
}