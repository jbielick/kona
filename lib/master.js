var path = require('path');
var utilities = require('utilities');
var file = utilities.file;
var child_process = require('child_process');
var newFork, oldFork;
var currentFork;

module.exports = function(program) {
  var timesStarted = 0;

  function fork() {
    var args = program.rawArgs.slice(2),
        execArgs = process.execArgv;

    // if argv includes debug flag, add to child fork execArgv
    if (~process.argv.indexOf('--debug')) {
      execArgs.push('--debug');
    } else if (~process.argv.indexOf('--debug-brk')) {
      execArgs.push('--debug-brk');
    }

    // child process is a worker
    args.push('--worker');

    // create a fork, run kona bin file with same args but include worker flag
    currentFork = child_process.fork(path.join(__dirname, '..', 'bin', 'kona'), args, {
      execArgv: execArgs
    });
    timesStarted++;
    currentFork.on('close', fork);
  }

  setInterval(function failsafe() {
    if (timesStarted > 1) {
      console.error("ERR: Kona failed to start. Forcing exit...");
      currentFork.kill();
      process.exit(0);
    }
    timesStarted = 0;
  }, 300);

  ['controllers', 'models', 'helpers', 'views'].forEach(function (dir) {
    file.watch(path.join(process.cwd(), 'app', dir), function (file) {
      currentFork.kill();
    });
  });
  file.watch(path.join(process.cwd(), 'config'), function (file) {
    currentFork.kill();
  });
  fork();
}