var koa = require('koa');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var repl = require('repl');
var utilities = require('utilities');
var file = utilities.file;
var numWorkers = 1; //require('os').cpus().length;
var util = require('util');

/**
 * the application module that will house the koa app and provide
 * an api layer to registering middleware, establishing db connections,
 * configuring routes and rendering responses via controllers
 * 
 * @param {Object} options Command line arguments pass in via Commander or 
 *                           object of options
 */
function Kona() {
  this.koa = koa();
  this._root = path.resolve(__dirname, '..');
  this.root = process.cwd();
  this.appPath = path.join(this.root, 'app');
  this.env = this.environment = process.env.NODE_ENV || 'development';
  this.version = require(path.join(this._root, 'package.json')).version
  this.stream = [
    'metric',
    'logger',
    'static',
    'error',
    'autoresponder',
    'session',
    'body-parser',
    'method-override',
    'router',
    'views',
    'dispatcher'
  ];
  this.config = this.configure();
  /* h4x */
  this.use = this.koa.use.bind(this.koa);
  this.on = this.koa.on.bind(this.koa);
  this.emit = this.koa.emit.bind(this.koa);
  /* /h4x */
  this.expose();
  this.mount();
  this.bootstrap(this.config);
}

/**
 * requires the appropriate configuration files, calls the exported function
 * providing the config module. first the application.js and then the 
 * {environment}.js file if it exists.
 * 
 * @param  {Object} args application options as passed in via constructor
 */
Kona.prototype.configure = function (options) {
  var config, appConfig, envConfig;

  config = require(path.join(this._root, 'lib', 'config'))(this);

  // application.js configuration
  appConfig = require(path.join(this.root, 'config', 'application'))(config);

  try {
    // environment config overrides ex. development.js
    envConfig = require(path.join('config', this.env))(config);
  } catch (e) {}
  return config;
};

/**
 * bootstraps the application by loading middleware in the order of the stream
 * requires each middleware file and calls the function exported by that file
 * providing the application as an argument.
 * 
 * @param  {Object} config config object (see lib/config.js)
 * @param  {Object} options options or arguments passed in via constructor    
 * @return {[type]}        [description]
 */
Kona.prototype.bootstrap = function (config, options) {
  var app = this;

  this.stream.forEach(function (middlewareName) {
    var mwPath = path.join(app._root, 'lib', 'middleware', middlewareName);
    require(mwPath)(app);
  });
};

/**
 * exposes the kona object globally
 */
Kona.prototype.expose = function () {
  global.Kona = this;
};

/**
 * mount the extendable controller and model modules to build a base for the
 * application api modules
 */
Kona.prototype.mount = function () {
  this.Controller = require(path.join(this._root, 'lib', 'api', 'controller'));
  // this.Model = require(path.join(this._root, 'lib', 'api', 'model'))
};

/**
 * starts the kona repl
 */
Kona.prototype.console = function (options) {
  repl.start({
    prompt: util.format('kona~%s > ', this.version),
    useColors: true
  });
};

/**
 * cluster this development node process so the file tree
 * can be watch and a new proc forked to uptake the changes
 */
Kona.prototype.cluster = function (options) {
  var _this = this,
      debug = this.env === 'development' && options.debug,
      i;
  if (debug) {
    numWorkers = 1;
    process.execArgv.push('--debug');
  }
  for (i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  // if (debug) { process.execArgv.pop(); }
  // cluster
  //   .on('exit', function (worker, code, signal) { cluster.fork(); })
  //   .on('listening', function (worker) {
  //     util.log('Worker PID: %s', worker.process.pid);
  //   });
};

/**
 * kills off existing worker processes
 */
Kona.prototype.killWorkers = function () {
  Object.keys(cluster.workers).forEach(function (id) {
    cluster.workers[id].kill();
  });
};

/**
 * start the http server and listen
 * @return {[type]} [description]
 */
Kona.prototype.listen = function (options) {
  options || (options = {});
  console.log(this.env);
  var port = options.port || process.env.KONA_PORT || this.config.port;
  if (false && cluster.isMaster && numWorkers > 0) {
    this.cluster(options);
  } else {
    this.koa.listen(port);
    // application is started
    console.log();
    console.log('(|) Kona server started on port %s', port);
    console.log();
  }
};

module.exports = new Kona;