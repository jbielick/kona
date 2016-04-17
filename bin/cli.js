#!/usr/bin/env node --harmony

var path = require('path');
var program = require('commander');
var pkgRoot = path.resolve(__dirname, '..');

program
  .version(require(path.join(pkgRoot, 'package.json')).version)
  .command('server', 'start the application server')
  .command('console', 'start the Kona console REPL')
  .command('routes', 'view the application routes (text)')
  .command('generate <objectAndOptions...>', 'generate application code')
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}
