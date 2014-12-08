var path = require('path');
var fs = require('fs');
var _ = require('./utilities');
var support = {};

var files = fs.readdirSync(__dirname);
files.forEach(function(file) {
  var key;
  if (file !== path.basename(__filename) && file[0] !== '.') {
    key = _.camelize(_.underscore(path.basename(file, '.js')));
    support[key] = require(path.join(__dirname, file));
  }
});

module.exports = support;