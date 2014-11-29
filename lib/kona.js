var koa = require('koa');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var repl = require('repl');
var util = require('util');
var read = require('fs-readdir-recursive');
var bean = require(path.join(__dirname, 'utilities', 'bean'));
var support = require(path.join(__dirname, 'support'));
var LivePath = support.LivePath;
var chalk = require('chalk');
var debug = require('debug')('kona');
var winston = require('winston');


module.exports = (function(root) {

  /**
   * the application module that will house the koa app and provide
   * an api layer to registering middleware, establishing db connections,
   * loading application routes, controllers, models and helpers
   *
   * @param {Object} program  program options from commander
   * @param {String} env environment to start in (override)
   */
  function Kona(program, env) {
    program || (program = {});
    this.inApp = inApp();
    this.bootstrap(program, env);
    this.expose('Kona', this);
    this.config = this.configure();
    this.buildStack(this.config);
    // application is started
  }

  /**
   * requires the appropriate configuration files, calls the exported function
   * providing the config module. first the application.js and then the
   * {environment}.js file if it exists.
   *
   * @param  {Object} args application options as passed in via constructor
   */
  Kona.prototype.configure = function() {
    var appConfigPath = this.root.join('config', 'application'),
        envConfigPath = path.join('config', this.env),
        config, appConfig, envConfig;

    config = require(this._root.join('lib', 'config'))(this);

    try {
      if (fs.existsSync(appConfigPath)) {
        // application.js configuration
        appConfig = require(appConfigPath)(config);
      }
      if (fs.existsSync(envConfigPath)) {
        // environment config overrides ex. development.js
        envConfig = require(envConfigPath)(config);
      }
    } catch (e) {
      console.error(e);
    }
    return config;
  };

  /**
   * bootstraps the application by loading middleware in the order of the
   * middleware requires each middleware file and calls the function exported by
   * that file providing the application as an argument.
   *
   * @param  {Object} config config object (see lib/config.js)
   * @param  {Object} options options or arguments passed in via constructor
   * @return {[type]}        [description]
   */
  Kona.prototype.bootstrap = function(program, env) {
    var _this = this,
        appRoot = process.cwd(),
        logTransports = [],
        logFilePath,
        logFile,
        controllersPath,
        modelsPath;

    this.worker = !!process.send;

    this.koa = koa();

    this.root = new LivePath(process.cwd());
    this._root = new LivePath(path.resolve(__dirname, '..'));
    this.version = require(this._root.join('package.json')).version;
    this.env = env || program.environment || process.env.NODE_ENV || 'development';

    logFilePath = this.root.join('log', this.env + '.log');

    try {
      logFile = fs.openSync(logFilePath, 'a+');
    } catch(e) {
      if (_this.inApp) {
        console.error('Couldn\'t open log file at %s', logFile);
        logTransports.push(new (winston.transports.Console)());
      } else {
        logFilePath = '/dev/null';
        logTransports.push(new (winston.transports.File)({filename: logFilePath}));
      }
    } finally {
      this.log = new (winston.Logger)({transports: logTransports});
    }

    this.koa.on('error', function(err, ctx) {
      _this.log.error(err.message, err.stack);
    });

    // expose lodash on kona app object
    this._ = support.utilities;
    // expose lodash + inflections on kona object
    this.inflector = support.inflector;

    // dirty proxy
    this.use = this.koa.use.bind(this.koa);
    this.on = this.koa.on.bind(this.koa);
    this.emit = this.koa.emit.bind(this.koa);

    this.mount();
  };

  /**
   * requires barebones Kona stack middleware and pushes them to the koa
   * middleware stack one by one
   *
   * @param  {Config} config  Kona Config object (see lib/config.js)
   */
  Kona.prototype.buildStack = function(config) {
    var controllersPath,
        modelsPath;

    controllersPath = this.root.join('app', 'controllers'),
    modelsPath = this._root.join('lib', 'api', 'model');

    if (this.inApp) {
      this.controllers = this.loadObjects(controllersPath, '-controller');
      // this.models = this.loadObjects(modelsPath);
    }

    [
      'metric',
      'logger',
      'static',
      'error',
      'autoresponder',
      'session',
      'body-parser',
      'method-override',
      'etag',
      'router',
      'views',
      'dispatcher',
      'renderer'
    ].forEach(function(moduleName) {
      var mwPath = this._root.join('lib', 'middleware', moduleName);
      require(mwPath)(this);
    }.bind(this));
  };

  /**
   * exposes objects globally
   */
  Kona.prototype.expose = function(name, object) {
    if (global[name] && this.env !== 'test') {
      debug(util.format('global "%s" already exists', name));
    }
    global[name] = object;
  };

  /**
   * mount the extendable controller and model modules to build a base for the
   * application api modules
   */
  Kona.prototype.mount = function() {
    // expose the base and api controller
    this.Controller = {
      Base: require(this._root.join('lib', 'api', 'base-controller'))
    };
    // expose base model
  };

  /**
   * given a directory, will recursively require all modules and key their
   * export by their name less a "strip" string and return that
   * object (including nested)
   *
   * @param  {String} dir   directory to recursively load from
   * @param  {string} strip optional string to strip from the module filename
   *                        to generate the key
   * @return {Object}       an object whose keys are relative path + module
   *                           name less the stripped string and values that
   *                           are the export of that module.
   */
  Kona.prototype.loadObjects = function(dir, strip) {
    var _this = this,
        objects = {},
        strip = new RegExp((strip || '') + '\.js', 'i');
    read(dir).forEach(function(moduleName) {
      var key = moduleName.replace(strip, ''),
          constructor;
      try {
        constructor = require(path.join(dir, moduleName));
        constructor.name = key;
        objects[key] = constructor;
        debug(util.format('Loaded: %s', moduleName));
      } catch(e) {
        _this.log.error(util.format("Failed to load %s: %s \n %s \n", moduleName, e.message, e.stack));
        _this.koa.onerror(e);
      }
    });
    return objects;
  };

  /**
   * starts the kona repl
   */
  Kona.prototype.console = function(options) {
    return repl.start({
      prompt: util.format('kona~%s > ', this.version),
      useColors: true,
      input: this.env === 'test' ? fs.createReadStream('/dev/null') : process.stdin,
      output: this.env === 'test' ? fs.createWriteStream('/dev/null') : process.stdout
    });
  };

  /**
   * start the http server and listen
   * @return {HTTP}
   */
  Kona.prototype.listen = function(port) {
    var server;
    this.port = port || process.env.KONA_PORT || this.config.port;
    server = this.koa.listen(this.port);
    if (this.env !== 'test') {
      console.log(bean([
        'listening on ' + chalk.dim(this.port),
        'Env: ' + chalk.dim(this.env)
      ]));
    }
    return server;
  };

  return Kona;

})(root);

function inApp() {
  return fs.existsSync(path.join(process.cwd(), 'config', 'application.js'));
}