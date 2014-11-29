var path = require('path');

module.exports = {
  LivePath: require(path.join(__dirname, 'live-path')),
  utilities: require(path.join(__dirname, 'utilities')),
  Params: require(path.join(__dirname, 'params')),
  inflector: require(path.join(__dirname, 'utilities'))
}