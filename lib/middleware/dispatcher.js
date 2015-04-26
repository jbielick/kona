var path = require('path');
var debug = require('debug')('kona:dispatcher');
var format = require('util').format;
var assert = require('assert');
var RequestController = require('../controller/request');

module.exports = function (app) {

  app.use(dispatcher());

  function dispatcher () {

    return function* (next) {

      var match = this.router.match,
          name,
          namespaces,
          controllerPath,
          Controller;

      // no route match, throw
      if (!match) {
        return this.throw(404, format('No route found matching %s', this.url));
      }

      // router provides controller path as defined in routes
      // ex: 'geographies/regions/countries' for counties-controller.js at the
      // path app/controllers/geographies/regions/
      namespaces = match.controller.split('/');
      name = namespaces.pop();

      controllerPath = app.root.join(
        'app',
        'controllers',
        path.join.apply(path, namespaces),
        name + '-controller'
      );

      // require the controller for this request
      Controller = require(controllerPath);

      debug(format("found %s-controller", name));

      // construct a new controller instance for the request
      this.controller = new Controller(this);

      // attach name ex: 'photos' for 'photos-controller.js'
      this.controller.name = name;

      // controller module must inherit from kona request controller
      assert(this.controller instanceof RequestController, format(
        'Cannot dispatch: %s does not inherit from RequestController',
        name
      ));

      // controller is mounted, continue downstream
      return yield next;

    };
  }

};