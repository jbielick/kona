#!/usr/bin/env node --harmony

var debug = require('debug')('kona');
var path = require('path');
var fs = require('fs');
var path = require('path');
var konaRoot = path.resolve(__dirname, '..');
var Kona = require(path.join(konaRoot, 'lib', 'kona'));
var program = require('commander');

program
  .version(require(path.join(konaRoot, 'package.json')).version)
  .option('-e, --environment', 'the application environment to run')
  .option('--debug', 'start the application with debugger running')
  .option('--debug-brk', 'start the application with an immediate debugger');

/* istanbul ignore next */
program
  .command('server')
  .alias('s')
  .description('start the application server')
  .action(function() {
    ensureApp();
    (new Kona(program)).listen();
  });

/* istanbul ignore next */
program
  .command('routes')
  .description('view the application routes (text)')
  .action(function() {
    ensureApp();
    console.log((new Kona(program)).router.toString());
    process.exit(0);
  });

/* istanbul ignore next */
program
  .command('console')
  .alias('c')
  .description('start the Kona console REPL')
  .action(function() {
    ensureApp();
    (new Kona(program)).console();
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