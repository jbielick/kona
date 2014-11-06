var path = require('path');

module.exports = function(app) {

  function Config() {}
  Config.prototype.get = function(prop) {
    return this[prop];
  }
  Config.prototype.set = function(prop, value) {
    return this[prop] = value;
  }

  var config = Object.create(Config.prototype);

  /**
   * path containing all of the application's views
   */
  Object.defineProperty(config, 'viewPath', {
    writable: true,
    value: path.join(app.appPath, 'views')
  });

  /**
   * view-file extension to use application-wide
   */
  Object.defineProperty(config, 'viewExt', {
    writable: true,
    value: 'html.ejs'
  });

  /**
   * where to server static files from
   * @type {Boolean}
   */
  Object.defineProperty(config, 'publicPath', {
    writable: true,
    value: path.join(app.appPath, 'public')
  });

  /**
   * asset paths
   * @type {Boolean}
   */
  Object.defineProperty(config, 'assetPaths', {
    writable: false,
    value: [path.join(app.appPath, 'assets')]
  });

  /**
   * the port the application will run on
   * is overrided by process.env.KONA_PORT
   */
  Object.defineProperty(config, 'port', {
    writable: true,
    value: 3333
  });

  /**
   * session store
   * @param  {[type]} )    {                        debugger          } [description]
   * @param  {[type]} set: function(connection) {            debugger    }}          [description]
   * @return {[type]}      [description]
   */
  Object.defineProperty(config, 'sessionStore', {
    get: function() {
      debugger
    },
    set: function(connection) {
      debugger
    }
  })

  return config;
}