var Kona = require('kona');
var app = new Kona({root: __dirname});

app
  .initialize()
  .then(function(app) {
    app.listen();
  });