var Hash = require('hashjs');
var _ = require('lodash');

module.exports = function Traversable(obj) {
  var data = obj || {};
  return function traversable(path, value) {
    if (!_.isUndefined(value)) {
      return Hash.insert(data, path, value);
    } else {
      return Hash.get(data, path, value);
    }
  }
}

