#!/usr/bin/env node --harmony

var debug = require('debug')('kona');
var path = require('path');
var fs = require('fs');
var path = require('path');
var pkgRoot = path.resolve(__dirname, '..');
var Kona = require(path.join(pkgRoot, 'lib', 'kona'));
var program = require('commander');

program
  .version(require(path.join(pkgRoot, 'package.json')).version)
  .option('-e, --environment [env]', 'the application environment to run')
  .option('-p, --port [port]', 'the port to run the kona server on')
  .option('--debug', 'start the application with debugger running')
  .option('--debug-brk', 'start the application with an immediate debugger');

/* istanbul ignore next */
program
  .command('server')
  .alias('s')
  .description('start the application server')
  .action(function() {
    withApp()
      .initialize()
      .then(function(app) {
        app.listen(program.port);
      })
      .catch(function(err) {
        console.error(err.stack);
        process.exit(1);
      });
  });

program
  .command('generate <objectAndOptions...>')
  .alias('g')
  .description('generate application code')
  .action(function(objectAndOptions) {
    var yeoman = require('yeoman-environment');
    var env = yeoman.createEnv();

    env.lookup(function () {
      env.run('kona:' + objectAndOptions.join(' '));
    });
  });

/* istanbul ignore next */
program
  .command('routes')
  .description('view the application routes (text)')
  .action(function() {
    withApp()
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
  });

/* istanbul ignore next */
program
  .command('console')
  .alias('c')
  .description('start the Kona console REPL')
  .action(function() {
    withApp()
      .initialize()
      .then(function(app) {
        app.console();
      })
      .catch(function(err) {
        console.error(err.stack);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

/* istanbul ignore next */
function withApp() {
  if (!fs.existsSync(path.join(process.cwd(), 'config', 'application.js'))) {
    console.error('You don\'t seem to be in a kona app directory!');
    return process.exit(1);
  }
  return new Kona(program);
}