var path = require('path');

module.exports = function(app) {

  /**
   * the basic config object with getter / setter methods in favor of older
   * APIs, but uses native getters and setters
   */
  var config = Object.create({});

  /**
   * path containing all of the application's views
   */
  Object.defineProperty(config, 'views', {
    writable: true,
    value: app.root.join('app', 'views')
  });

  /**
   * view-file extension to use application-wide
   */
  Object.defineProperty(config, 'viewExt', {
    writable: true,
    value: 'html'
  });

  /**
   * map extensions to render engines
   */
  Object.defineProperty(config, 'viewMap', {
    writable: true,
    value: {
      html: 'swig'
    }
  });

  Object.defineProperty(config, 'watch', {
    writable: true,
    value: [
      app.root.join('app', 'controllers'),
      app.root.join('app', 'models')
    ]
  });

  /**
   * where to server static files from
   * @type {Boolean}
   */
  Object.defineProperty(config, 'publicPath', {
    writable: true,
    value: app.root.join('public')
  });

  /**
   * asset paths
   * @type {Boolean}
   */
  Object.defineProperty(config, 'assetPaths', {
    writable: true,
    value: [app.root.join('app', 'assets')]
  });

  /**
   * the port the application will run on
   * is overrided by process.env.KONA_PORT
   */
  Object.defineProperty(config, 'port', {
    writable: true,
    value: 3333
  });

  return config;
}