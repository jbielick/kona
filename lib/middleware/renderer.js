module.exports = function(app) {

  app.use(renderer());

  function renderer() {
    return function* renderer(next) {

      if (app._.isUndefined(this.controller) ||
        app._.isUndefined(this.controller._render)) {
        return yield next;
      }

      var args = this.controller._render,
          options;

      if (args.length === 1 && app._.isString(args[0])) {
        template = args[0];
        if (template === false) {
          return this.response.nothing = true;
        } else {
          yield this.render(template, this.locals);
        }
      } else {
        if (app._.isPlainObject(args[0])) {
          options = args[0];

          if (options.template || options.view) {
            return yield this.render((options.template || options.view), this.locals);
          } else if (app._.has(options, 'json')) {
            this.body = options.json;
          } else if (app._.has(options, 'text')) {
            this.type = 'text/plain';
            this.body = options.text;
          }
          return yield next;
        } else {
          return this.throw(500, 'Invalid Object given to #render');
        }
      }
    }
  }
};