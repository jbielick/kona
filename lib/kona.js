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
var co = require('co');

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
}


// inherits from Koa
inherits(Kona, Koa);


/**
 * extend Kona.prototype
 */
_.extend(Kona.prototype, require('./extensions/logger'));
_.extend(Kona.prototype, require('./extensions/watch'));
_.extend(Kona.prototype, require('./extensions/hooks'));


/**
 * requires the appropriate configuration files, calls the exported function
 * providing the config module. first the application.js and then the
 * {environment}.js file if it exists.
 *
 * @param  {Object} args application options as passed in via constructor
 */
Kona.prototype.configure = function* () {
  var appConfigPath = this.root.join('config', 'application'),
      envConfigPath = join('config', this.env),
      config, appConfig, envConfig;

  debug('configuring');
  this.emit('config:before', this);

  // require the config object, given as the argument to exported `configure`
  // functions in application/environment config files
  config = require(this._root.join('lib', 'config'))(this);

  // only load application config if we're in an app
  if (this.inApp) {
    // application.js configuration
    appConfig = require(appConfigPath)(config);

    // environmental override configs are optional
    if (fs.existsSync(envConfigPath)) {
      // environment config overrides eg development.js
      // should export a function that takes the config object as an arg
      envConfig = require(envConfigPath)(config);
    }
  }

  this.emit('config:after', this, config);

  return config;
};


Kona.prototype.initialize = function(cb) {

  if (this._ready) {
    throw new Error('Already initialized');
  }

  co.wrap(function *() {

    yield this.loadHooks();

    this.config = yield this.configure();

    yield this.hook('configure');

    this.loadMiddleware(this.config);

    yield this.hook('initialize');

    if (this.inApp) {
      if (this.env === 'production' || this.config.eagerLoadModules) {
        require('require-all')(this.root.join('app', 'controllers'));
        // require('require-all')(this.root.join('app', 'models'));
      }
      if (this.env === 'development') {
        this.watchModules();
      }
    }

    this._ready = true;

    debug('initialized');

    this.emit('ready', this);

  }).call(this).then(function() {

    cb && cb.call(this);

  }.bind(this)).catch(function(err) {

    this.onerror(err);
    console.error('Kona failed to initialize: %s', err.stack);
    process.exit(1);

  }.bind(this));

  return this;

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

  this.expose('kona', this);

  // livepath for the application root
  this.root = new LivePath(options.root || process.cwd());

  // livepath for the kona module root
  this._root = new LivePath(path.resolve(__dirname, '..'));

  // kona's module semver version
  this.version = require(this._root.join('package.json')).version;

  this.env = process.env.NODE_ENV || 'development';

  // detect if we're in an kona application cwd
  this.inApp = fs.existsSync(this.root.join('config', 'application.js'));

  // create a winston logger instance
  this.log = this.createLogger(this.root.join('log', this.env + '.log'));

  this.on('error', function(err, ctx) {
    var messages = [err.message, err.stack];
    // if (ctx) {
    //   messages.push(ctx);
    // }
    this.log.error.apply(this.log, messages);
  }.bind(this));

  // expose support objects on kona global
  this.support = support;
  // expose lodash
  this._ = support.Utilities;
  // lodash + inflections
  this.inflector = support.inflector;

  this.mountBaseModules();

  this.modules = {};
  this.hooks = {};

  this.middlewares = [
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
    'autoresponder'
  ];

  this.emit('bootstrap:after');
};


/**
 * requires barebones Kona stack middleware and pushes them to the koa
 * middleware stack one by one
 *
 * @param  {Config} config  Kona Config object (see lib/config.js)
 */
Kona.prototype.loadMiddleware = function (config) {

  this.emit('middleware:before');

  this.middlewares.forEach(function (moduleName) {

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
    Base: require(this._root.join('lib', 'controller', 'base'))
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
  var bean,
      server;

  if (!this._ready) {
    throw new Error('Cannot call #listen before Kona has been intialized');
  }

  bean = require(join(__dirname, 'utilities', 'bean'));

  if (this.env === 'test') {
    delete this.port;
  } else {
    this.port = port || process.env.KONA_PORT || this.config.port;
  }
  this.server = Koa.prototype.listen.call(this, this.port);
  debug('listening');
  /* istanbul ignore if */
  if (this.env !== 'test') {
    console.log(bean([
      'listening on ' + chalk.dim(this.port),
      'Env: ' + chalk.dim(this.env)
    ]));
  }
  return this.server;
};

/**
 * gracefully stop the http(s) server and close after requests are complete.
 * @return {void}
 */
Kona.prototype.shutdown = function() {
  if (this.server) {
    debug('shutting down...');
    co.wrap(function* () {
      this.hook('shutdown');
    }).call(this);
    this.server.close(function() {
      debug('goodbye!');
    });
  }
};

module.exports = Kona;