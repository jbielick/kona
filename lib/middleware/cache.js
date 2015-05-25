var Cache = require('node-cache');

module.exports = function(app) {

  if (app.config.cache.store !== 'memory') return;

  app.use(caching());

  function caching() {

    var store = new Cache(app.config.cache);

    return function* (next) {

      this.cache = store;
      return yield next;

    }
  }
};