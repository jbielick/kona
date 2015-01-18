#!/usr/bin/env node --harmony

var debug = require('debug')('kona');
var path = require('path');
var fs = require('fs');
var path = require('path');
var pckgRoot = path.resolve(__dirname, '..');
var Kona = require(path.join(pckgRoot, 'lib', 'kona'));
var program = require('commander');

program
  .version(require(path.join(pckgRoot, 'package.json')).version)
  .option('-e, --environment', 'the application environment to run')
  .option('-p, --port', 'the port to run the kona server on')
  .option('--debug', 'start the application with debugger running')
  .option('--debug-brk', 'start the application with an immediate debugger');

/* istanbul ignore next */
program
  .command('server')
  .alias('s')
  .description('start the application server')
  .action(function() {
    ensureApp();
    var app = new Kona(program);
    app.initialize().on('ready', function() {
      this.listen(program.port);
    });
  });

/* istanbul ignore next */
program
  .command('routes')
  .description('view the application routes (text)')
  .action(function() {
    ensureApp();
    var app = new Kona(program);
    app.initialize().on('ready', function() {
      console.log();
      console.log(this.router.toString());
      console.log();
      app.shutdown();
    });
  });

/* istanbul ignore next */
program
  .command('console')
  .alias('c')
  .description('start the Kona console REPL')
  .action(function() {
    ensureApp();
    var app = new Kona(program);
    app.initialize().on('ready', function() {
      this.console();
    });
  });

program.parse(process.argv);

/* istanbul ignore next */
if (program.args.length < 1) {
  program.help();
}

/* istanbul ignore next */
function ensureApp() {
  if (!fs.existsSync(path.join(process.cwd(), 'config', 'application.js'))) {
    console.error('You don\'t seem to be in a kona app directory!');
    return process.exit();
  }
}