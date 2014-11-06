var path = require('path');
var utilities = require('utilities');
var file = utilities.file;
var child_process = require('child_process');
var newFork, oldFork;
var currentFork;

module.exports = function(program, kona) {
  var timesStarted = 0;

  function fork() {
    var args = process.execArgv;
    if (process.argv.indexOf('--debug') > -1) {
      args.push('--debug');
    }
    currentFork = child_process.fork(path.join(__dirname, 'listen'), [], {
      execArgv: args
    });
    timesStarted++;
    currentFork.on('close', fork);
  }

  setInterval(function() {
    if (timesStarted > 3) {
      console.error("ERR: Kona failed to start. Forcing exit...");
      currentFork.kill();
      process.exit(0);
    }
    timesStarted = 0;
  }, 700);

  ['controllers', 'models', 'helpers'].forEach(function (dir) {
    file.watch(path.join(process.cwd(), 'app', dir), function (file) {
      currentFork.kill();
    });
  });
  file.watch(path.join(process.cwd(), 'config'), function (file) {
    currentFork.kill();
  });
  fork();
}