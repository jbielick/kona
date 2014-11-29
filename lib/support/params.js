var Hash = require('hashjs');
var _ = require('lodash');

module.exports = function Params(obj) {
  var data = obj || {};
  return function params(path, value) {
    if (!_.isUndefined(value)) {
      return Hash.insert(data, path, value);
    } else {
      return Hash.get(data, path, value);
    }
  }
}

