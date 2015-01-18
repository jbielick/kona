var Kona = require('kona');
var app = new Kona();

app.initialize().on('ready', app.listen);