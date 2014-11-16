var koa = require('koa');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var repl = require('repl');
var utilities = require('utilities');
var file = utilities.file;
var util = require('util');
var read = require('fs-readdir-recursive');

module.exports = (function(root) {

  /**
   * the application module that will house the koa app and provide
   * an api layer to registering middleware, establishing db connections,
   * configuring routes and rendering responses via controllers
   * 
   * @param {Object} options Command line arguments pass in via Commander or 
   *                           object of options
   */
  function Kona() {
    this.bootstrap(this.config);
    this.config = this.configure(this.env);
    this.inApp = inApp();
    if (this.inApp) {
      this.mount();
    }
    this.buildStack(this.config);
    this.expose('Kona', this);
    // application is started
    if (this.env !== 'test') {
      console.log();
      console.log('(|) Kona started');
    }
  }

  /**
   * requires the appropriate configuration files, calls the exported function
   * providing the config module. first the application.js and then the 
   * {environment}.js file if it exists.
   * 
   * @param  {Object} args application options as passed in via constructor
   */
  Kona.prototype.configure = function (env) {
    var appConfigPath = this.root.join('config', 'application'),
        envConfigPath = path.join('config', env),
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
  Kona.prototype.bootstrap = function (config) {
    var appRoot = process.cwd();

    this.koa = koa();

    function LivePath(_path) {
      this.toString = this.valueOf = function() { return _path; };
      this.join = function() { 
        var args = [].slice.call(arguments);
        args.unshift(_path);
        return path.join.apply(path, args);
      }
    }

    this.root = new LivePath(process.cwd());
    this._root = new LivePath(path.resolve(__dirname, '..'));
    this.version = require(this._root.join('package.json')).version;
    this.env = process.env.NODE_ENV || 'development';

    // dirty proxy
    this.use = this.koa.use.bind(this.koa);
    this.on = this.koa.on.bind(this.koa);
    this.emit = this.koa.emit.bind(this.koa);
    // setup logger
  };

  Kona.prototype.buildStack = function(config, options) {
    var _this = this;

    options || (options = {});

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
      'dispatcher'
    ].forEach(function (moduleName) {
      var mwPath = _this._root.join('lib', 'middleware', moduleName);
      require(mwPath)(_this);
    });
  };

  /**
   * exposes objects globally
   */
  Kona.prototype.expose = function (name, object) {
    if (global[name] && this.env !== 'test') {
      debug(util.format('global "%s" already exists', name));
    }
    global[name] = object;
  };

  /**
   * mount the extendable controller and model modules to build a base for the
   * application api modules
   */
  Kona.prototype.mount = function () {
    var _this = this,
      objects = {
        controllers: {},
        models: {}
      };
    this.Controller = objects.controllers['base'] = 
      require(this._root.join('lib', 'api', 'base-controller'));
    if (fs.existsSync(this.root.join('app', 'controllers'))) {
      read(this.root.join('app', 'controllers')).forEach(function (controllerPath) {
        var filePath = _this.root.join('app', 'controllers', controllerPath),
            key = controllerPath.replace(/\-controller\.js$/mi, ''),
            constructor;
        try {
          constructor = require(filePath);
          constructor.name = key;
          objects.controllers[key] = constructor;
        } catch(e) {
          // _this.log.error('Failed to require %s', path);
          console.log("Failed to load %s: %s \n %s \n", filePath, e.message, e.stack);
        }
      });
      this.controllers = objects.controllers;
    }
    // this.Model = require(this._root.join('lib', 'api', 'model'))
    // this.models = objects.models;
    return objects;
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
   * start the http server and listen
   * @return {[type]} [description]
   */
  Kona.prototype.listen = function (port) {
    this.port = port || process.env.KONA_PORT || this.config.port;
    this.koa.listen(this.port);
  };

  return Kona;

})(root);

function inApp() {
  return fs.existsSync(path.join(process.cwd(), 'config', 'application.js'));
}