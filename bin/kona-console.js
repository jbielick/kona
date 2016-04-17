#!/usr/bin/env node --harmony

var program = require('commander');
var withApp = require('./with-app');

program
  .option('-p, --port [port]', 'the port to run the kona server on')
  .option('-e, --environment [env]', 'the application environment to run')
  .parse(process.argv);

withApp(program)
  .initialize()
  .then(function(app) {
    app.console();
  })
  .catch(function(err) {
    console.error(err.stack);
    process.exit(1);
  });