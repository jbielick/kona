var Koa = require('koa');
var debug = require('debug')('kona');
var fs = require('fs');
var path = require('path');
var join = path.join;
var repl = require('repl');
var util = require('util');
var inherits = util.inherits;
var format = util.format;
var support = require('./support');
var LivePath = support.LivePath;
var chalk = require('chalk');
var _ = require('lodash');
var co = require('co');
var http = require('http');
var dotenv = require('dotenv');

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

  options = options || {};

  // setup kona root and application paths / helpers
  this.setupPaths(options);

  // setup env vars, logger, needed modules
  this.setupEnvironment(options);

  this.loadMixins(this.root.join('package.json'));
}


// inherits from Koa
inherits(Kona, Koa);


/**
 * extend Kona.prototype
 */
_.extend(Kona.prototype,
  require('./kona/logger'),
  require('./kona/watch'),
  require('./kona/mixins'),
  require('./kona/hooks')
);
_.extend(Kona.prototype, {

  /**
   * requires the appropriate configuration files, calls the exported function
   * providing the config module. first the application.js and then the
   * {environment}.js file if it exists.
   *
   * @param  {Object} args application options as passed in via constructor
   */
  configure: function () {
    var appConfigPath = this.root.join('config', 'application'),
        envConfigPath = join('config', this.env),
        config, appConfig, envConfig;

    debug('configuring');

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

    this.config = config;

    return config;
  },


  initialize: function(cb) {

    if (this._ready) {
      cb && cb.call(this);
      return this;
    }

    co.wrap(function *() {

      this.configure();

      yield this.hookFor('configure');

      this.loadMiddleware(this.config);

      this.server = http.createServer(this.callback());

      if (this.inApp) {
        if (this.env === 'production' || this.config.eagerLoadModules) {
          this.config.autoloadPaths.forEach(function(autoloadPath) {
            require('require-all')(this.root.join(autoloadPath));
          }, this);
        }
        if (this.env === 'development') {
          this.watchModules(this.config.autoloadPaths);
        }
      }

      this._ready = true;

      yield this.hookFor('initialize');

      debug('initialized');

    }).call(this)

    .then(function() {

      this.emit('ready', this);

      cb && cb.call(this);

    }.bind(this))

    .catch(function(err) {

      this.onerror(err);
      console.error('Kona failed to initialize: %s', err.stack);
      process.exit(1);

    }.bind(this));

    return this;

  },


  /**
   * sets up root paths, application version
   *
   * @param  {Object} options options or arguments passed in via constructor
   */
  setupPaths: function (options) {

    this.expose('kona', this);

    // livepath for the application root
    this.root = new LivePath(options.root || process.cwd());

    // livepath for the kona module root
    this._root = new LivePath(path.resolve(__dirname, '..'));

    debug('Application CWD: ' + this.root.toString());

    // kona's module semver version
    this.version = require(this._root.join('package.json')).version;
  },

  /**
   * parse .env, global env vars, inApp check and setup middleware paths
   * for readiness
   *
   * @param  {Object} options kona construction options
   */
  setupEnvironment: function(options) {

    dotenv.config({path: this.root.join('.env'), silent: true});

    this.env = options.environment || process.env.NODE_ENV || 'development';

    // detect if we're in an kona application cwd
    this.inApp = fs.existsSync(this.root.join('config', 'application.js'));

    // create a winston logger instance
    this.mountLogger(this.env);

    // expose support objects on kona global
    this.support = support;
    // expose lodash
    this._ = support.Utilities;
    // lodash + inflections
    this.inflector = support.inflector;

    this.middlewarePaths = [
      'metrics',
      'logger',
      'static',
      'error',
      'cache',
      'session',
      'body-parser',
      'method-override',
      'etag',
      'views',
      'router',
      'dispatcher',
      'invocation',
      'autoresponder'
    ].map(function(name) {
      return path.resolve(__dirname, join('middleware', name));
    });
  },

  /**
   * requires barebones Kona middleware and pushes them to the koa
   * middleware stack one by one
   */
  loadMiddleware: function () {

    this.middlewarePaths.forEach(function (mwPath) {

      require(mwPath)(this);

      debug(format('mounted middleware/%s', path.basename(mwPath)));

    }, this);

  },


  /**
   * exposes objects globally
   * @param {String} name name of the global
   * @param {Mixed} object the value to assign to the global
   */
  expose: function (name, object) {
    if (global[name] && this.env !== 'test') {
      debug(format('global "%s" already exists', name));
    }
    return (global[name] = object);
  },


  /**
   * starts the kona repl
   */
  console: function () {

    var writeStream = fs.createWriteStream('/dev/null'),
        readStream = fs.createReadStream('/dev/null');

    return repl.start({
      prompt: format('kona~%s > ', this.version),
      useColors: true,
      input: this.env === 'test' ? readStream : process.stdin,
      output: this.env === 'test' ? writeStream : process.stdout
    });

  },


  /**
   * start the http server and listen
   * @return {HttpServer} koa server instance
   */
  listen: function () {

    var args = Array.prototype.slice.call(arguments),
        port = args.shift(),
        bean;

    if (!this._ready) {
      throw new Error('Cannot call #listen before Kona has been intialized');
    }

    bean = require('./utilities/bean');

    if (this.env === 'test') {
      delete this.port;
    } else {
      this.port = port || process.env.KONA_PORT || this.config.port;
    }

    args.unshift(this.port);

    this.server.listen.apply(this.server, args);

    debug('listening');

    /* istanbul ignore if */
    if (this.env !== 'test') {
      console.log(bean([
        'listening on ' + chalk.dim(this.port),
        'Env: ' + chalk.dim(this.env)
      ]));
    }

    return this.server;
  },


  /**
   * gracefully stop the http(s) server and close after requests are complete.
   * @return {void}
   */
  shutdown: function() {

    debug('shutting down...');

    var server = this.server;

    if (!server) return Promise.resolve();

    return co(function* () {
      yield this.hookFor('shutdown');
    }).then(function() {
      server.close(function() { debug('goodbye!'); });
    });

  }

});

module.exports = Kona;