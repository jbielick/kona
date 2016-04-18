var path = require('path');

module.exports = LivePath;

function LivePath(basepath) {
  this.__basepath = basepath;
}

LivePath.prototype.toString =
LivePath.prototype.valueOf = function() {
  return this.__basepath;
}

LivePath.prototype.join = function() {
  var args = [].slice.call(arguments);
  args.unshift(this.__basepath);
  return path.join.apply(path, args);
}