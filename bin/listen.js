var path = require('path');
var konaRoot = path.resolve(__dirname, '..');
var kona = require(path.join(konaRoot, 'lib', 'kona'));

kona.listen();