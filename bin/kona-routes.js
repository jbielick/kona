#!/usr/bin/env node --harmony

var program = require('commander');
var withApp = require('./with-app');

program.parse(process.argv);

withApp(program)
  .initialize()
  .then(function(app) {
    console.log();
    console.log(app.router.toString());
    console.log();
    app.shutdown();
  })
  .catch(function(err) {
    console.error(err.stack);
    process.exit(1);
  });