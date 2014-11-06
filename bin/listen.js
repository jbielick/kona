var path = require('path');
var konaRoot = path.resolve(__dirname, '..');
var Kona = require(path.join(konaRoot, 'lib', 'kona'));

var kona = new Kona();

kona.listen();