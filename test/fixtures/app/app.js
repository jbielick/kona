var Kona = require('kona');
var app = new Kona({root: __dirname});

app
  .initialize()
  .then(function(app) {
    app.listen();
  })
  .catch(function(err) {
    console.error(err.stack);
    process.exit(1);
  });