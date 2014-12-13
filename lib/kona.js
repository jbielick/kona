var Koa = require('koa');
var debug = require('debug')('kona');
var fs = require('fs');
var path = require('path');
var join = path.join;
var repl = require('repl');
var util = require('util');
var inherits = util.inherits;
var format = util.format;
var support = require(join(__dirname, 'support'));
var LivePath = support.LivePath;
var chalk = require('chalk');
var _ = require('lodash');

/**
 * the application module that will house the koa app and provide
 * an api layer to registering middleware, establishing db connections,
 * loading application routes, controllers, models and helpers
 *
 * @param {Object} options  options options from commander
 */
function Kona(options) {

  // call the koa constructor here
  Koa.call(this);

  options || (options = {});

  this.bootstrap(options);
  this.expose('kona', this);
  this.config = this.configure();
  this.loadMiddleware();
  if (this.inApp) {
    // lazily load modules
    if (this.env === 'production' ||
      (this.env === 'development' && this.config.eagerLoadModules)) {
      require('require-all')(this.root.join('app', 'controllers'));
      // require('require-all')(this.root.join('app', 'models'));
    }
    if (this.env === 'development') {
      this.watchModules();
    }
  }
  this.emit('initialized', this);
  debug('initialized');
}

/**
 * Kona constructor inherit from EventEmitter
 */
inherits(Kona, Koa);

/**
 * Mixins on the Kona prototype
 */
_.mixin(Kona.prototype, require('./extensions/logger'));
_.mixin(Kona.prototype, require('./extensions/watch'));

/**
 * requires the appropriate configuration files, calls the exported function
 * providing the config module. first the application.js and then the
 * {environment}.js file if it exists.
 *
 * @param  {Object} args application options as passed in via constructor
 */
Kona.prototype.configure = function () {
  var appConfigPath = this.root.join('config', 'application'),
      envConfigPath = join('config', this.env),
      config, appConfig, envConfig;

  debug('configuring');
  this.emit('config:before', this);

  config = require(this._root.join('lib', 'config'))(this);

  if (this.inApp) {
    // application.js configuration
    appConfig = require(appConfigPath)(config);
  }

  try {
    if (fs.existsSync(envConfigPath)) {
      // environment config overrides ex. development.js
      envConfig = require(envConfigPath)(config);
    }
  } catch (e) {
    if (['ENOENT', 'MODULE_NOT_FOUND'].indexOf(e.code) > -1) {
      console.error(e);
    } else {
      throw e;
    }
  }

  this.emit('config:after', this, config);

  return config;
};

/**
 * watches routes, controllers, models for changes and clears require cache
 * for those objects to be reloaded or clears routes and reloads them
 *
 * @return {void}
 */
Kona.prototype.watchModules = function() {
  this.watch(this.root.join('config', 'routes.js'), function() {
    this.emit('routes:reload');
  }.bind(this));
  this.config.watch.forEach(function(watchPatch) {
    this.watch(watchPatch, function(eventPath, stat) {
      delete require.cache[eventPath];
    });
  }.bind(this));
};

/**
 * bootstraps the application
 * sets up root paths, environment, applciation version/state, exposes support
 * modules, proxies the koa methods the Kona app object will need to expose, and calls
 * mount to create the middelware stack
 *
 * @param  {Object} options options or arguments passed in via constructor
 * @param  {String} environemnt string environment to override
 */
Kona.prototype.bootstrap = function (options) {

  debug('bootstrapping');
  this.emit('bootstrap:before');

  this.root = new LivePath(options.root || process.cwd());
  this._root = new LivePath(path.resolve(__dirname, '..'));
  this.version = require(this._root.join('package.json')).version;
  this.env = process.env.NODE_ENV || 'development';

  this.inApp = fs.existsSync(this.root.join('config', 'application.js'));

  this.log = this.createLogger(this.root.join('log', this.env + '.log'));
  this.on('error', function(err, ctx) {
    var messages = [err.message, err.stack];
    // if (ctx) {
    //   messages.push(ctx);
    // }
    this.log.error.apply(this.log, messages);
  }.bind(this));

  this.Support = support;
  // expose lodash
  this._ = support.Utilities;
  // lodash + inflections
  this.inflector = support.inflector;

  this.mountBaseModules();

  this.modules = {};

  this.emit('bootstrap:after');

  return this;
};

/**
 * requires barebones Kona stack middleware and pushes them to the koa
 * middleware stack one by one
 *
 * @param  {Config} config  Kona Config object (see lib/config.js)
 */
Kona.prototype.loadMiddleware = function (config) {
  var _this = this;

  this.emit('middleware:before');

  [
    'metrics',
    'logger',
    'static',
    'error',
    'session',
    'body-parser',
    'method-override',
    'etag',
    'router',
    'views',
    'dispatcher',
    'renderer',
    'autoresponder'
  ].forEach(function (moduleName) {
    var mwPath = this._root.join('lib', 'middleware', moduleName),
        eventName;

    eventName = format('middleware:%s:before', moduleName);
    this.emit(eventName, this);

    require(mwPath)(this);
    debug(format('loaded middleware: %s', moduleName));

    eventName = format('middleware:%s:after', moduleName);
    this.emit(eventName, this);

  }.bind(this));

  this.emit('middleware:after');
};

/**
 * require and expose base controller and base model for api module extension
 * within the application
 */
Kona.prototype.mountBaseModules = function () {
  this.Controller = {
    Base: require(this._root.join('lib', 'api', 'base-controller'))
  };
};

/**
 * exposes objects globally
 */
Kona.prototype.expose = function (name, object) {
  if (global[name] && this.env !== 'test') {
    debug(format('global "%s" already exists', name));
  }
  global[name] = object;
};

/**
 * starts the kona repl
 */
Kona.prototype.console = function (options) {
  return repl.start({
    prompt: format('kona~%s > ', this.version),
    useColors: true,
    input: this.env === 'test' ? fs.createReadStream('/dev/null') : process.stdin,
    output: this.env === 'test' ? fs.createWriteStream('/dev/null') : process.stdout
  });
};

/**
 * start the http server and listen
 * @return {HttpServer} koa server instance
 */
Kona.prototype.listen = function (port) {
  var bean = require(join(__dirname, 'utilities', 'bean')),
      server;

  if (this.env === 'test') {
    delete this.port;
  } else {
    this.port = port || process.env.KONA_PORT || this.config.port;
  }
  server = Koa.prototype.listen.call(this, this.port);
  debug('listening');
  /* istanbul ignore if */
  if (this.env !== 'test') {
    console.log(bean([
      'listening on ' + chalk.dim(this.port),
      'Env: ' + chalk.dim(this.env)
    ]));
  }
  return server;
};

module.exports = Kona;