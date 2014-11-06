var koa = require('koa');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var repl = require('repl');
var utilities = require('utilities');
var file = utilities.file;
var util = require('util');

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
    this.koa = koa();
    this._root = path.resolve(__dirname, '..');
    this.root = process.cwd();
    this.appPath = path.join(this.root, 'app');
    this.env = this.environment = process.env.NODE_ENV || 'development';
    this.version = require(path.join(this._root, 'package.json')).version
    this.middleware = [
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
    /* h4x */
    this.use = this.koa.use.bind(this.koa);
    this.on = this.koa.on.bind(this.koa);
    this.emit = this.koa.emit.bind(this.koa);
    /* /h4x */
    this.config = this.configure(this.env);
    this.expose('Kona', this);
    this.mount();
    this.bootstrap(this.config);
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
    var appConfigPath = path.join(this.root, 'config', 'application'),
        envConfigPath = path.join('config', env),
        config, appConfig, envConfig;

    config = require(path.join(this._root, 'lib', 'config'))(this);

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
  Kona.prototype.bootstrap = function (config, options) {
    var _this = this;

    options || (options = {});

    this.middleware.forEach(function (middlewareName) {
      var mwPath = path.join(_this._root, 'lib', 'middleware', middlewareName);
      require(mwPath)(_this);
    });
  };

  /**
   * exposes the kona object globally
   */
  Kona.prototype.expose = function (name, object) {
    if (global[name] && this.env !== 'test') {
      console.warn(util.format('global "%s" already exists', name));
    }
    global[name] = object;
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
   * start the http server and listen
   * @return {[type]} [description]
   */
  Kona.prototype.listen = function (port) {
    this.port = port || process.env.KONA_PORT || this.config.port;
    this.koa.listen(this.port);
  };

  return Kona;

})(root);