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

    var appConfigPath = this.root.join('config', 'application');
    var envConfigPath = this.root.join('config', 'environment', this.env + '.js');
    var appConfig;
    var envConfig;

     debug('configuring');

     appConfig = require(this._root.join('lib', 'config'))(this);

    if (fs.existsSync(appConfigPath)) {
      // application.js configuration
      require(appConfigPath).call(this, appConfig);
    }

    // environmental override configs are optional
    if (fs.existsSync(envConfigPath)) {
      // environment config overrides eg development.js
      // should export a function that takes the config object as an arg
      require(envConfigPath).call(this, appConfig);
    }

    return this.config = appConfig;

  },


  initialize: function() {

    var app = this;

    if (app.server) {
      return Promise.resolve(this);
    }

    return new Promise(function(resolve, reject) {

      var initializer = co.wrap(function *() {

        yield app.hookAround('configure', function* configure() {
          app.configure();
          // @DEPRECATE legacy hook
          yield app.hookFor('middleware');
          // end legacy hook
        });

        // create the application winston logger instance
        app.mountLogger(app.env);

        yield app.hookAround('middleware', function* loadMiddleware() {
          app.loadMiddleware(app.config);
          // @DEPRECATE legacy hook
          yield app.hookFor('middleware');
          // end legacy hook
        });

        app.server = http.createServer(app.callback());

      });

      initializer.call(app)
        .then(function emitReady() {

          debug('initialized');
          app.emit('ready', app);
          resolve(app);

        })
        .catch(function initializeFailureHandler(err) {

          app.onerror(err);
          reject(app);
          console.error('Kona failed to initialize: %s', err.stack);

        });

    });
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
      'request-id',
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

    if (!this.server) {
      throw new Error('Cannot call #listen before Kona has been intialized');
    }

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

    var app = this;
    var server = this.server;

    if (!server) return Promise.resolve();

    return co.wrap(function* () {
      yield this.hookFor('shutdown');
    }).call(this).then(function() {
      server.close(function() { debug('goodbye!'); });
    });

  }

});

module.exports = Kona;