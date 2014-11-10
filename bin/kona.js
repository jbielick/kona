#!/usr/bin/env node --harmony

var debug = require('debug')('kona');
var path = require('path');
var fs = require('fs');
var path = require('path');
var konaRoot = path.resolve(__dirname, '..');
var kona = require(path.join(konaRoot, 'lib', 'kona'));
var program = require('commander');

program
  .version(require(path.join(konaRoot, 'package.json')).version)
  .option('-e, --environment', 'the application environment to run')
  .option('--debug', 'start the application with debugger running')
  .option('--debug-brk', 'start the application with an immediate debugger');

program
  .command('new <appName>')
  .description('create a new Kona application')
  .action(function() {
    console.log('creating an app');
  });

program
  .command('server')
  .alias('s')
  .description('start the application server')
  .action(function() {
    ensureApp();
    require(path.join(konaRoot, 'lib', 'master'))(program, kona);
  });

program
  .command('console')
  .alias('c')
  .description('start the Kona console REPL')
  .action(function() {
    ensureApp();
    kona.console();
  });

program.parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

function ensureApp() {
  if (!fs.existsSync(path.join(process.cwd(), 'config', 'application.js'))) {
    console.error('You don\'t seem to be in a kona app directory!');
    return process.exit();
  }
}