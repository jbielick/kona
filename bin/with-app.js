var path = require('path');
var fs = require('fs');
var pkgRoot = path.resolve(__dirname, '..');
var Kona = require(path.join(pkgRoot, 'lib', 'kona'));

module.exports = function withApp(program) {
  if (!fs.existsSync(path.join(process.cwd(), 'config', 'application.js'))) {
    console.error('You don\'t seem to be in a kona app directory!');
    return process.exit(1);
  }
  return new Kona(program);
}