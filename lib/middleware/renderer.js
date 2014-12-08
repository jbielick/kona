module.exports = function(app) {

  app.use(renderer());

  /**
   * renders the body given instructions from BaseController#render
   *
   * example controller action:
   *
   *   index: function* () {
   *     var users = [];
   *
   *     yield this.respondTo({
   *       js: function* () {
   *         // this would render the string below with an
   *         // application/javascript Content-Type
   *         this.render('alert("javascript");');
   *       },
   *       json: function*() {
   *         // application/json and outputs the JSON
   *         this.render({json: users});
   *       },
   *       html: function*() { // autorenderer handles this },
   *       text: function*() {
   *         // this would render the string below with an
   *         // text/plain Content-Type
   *         this.render('hello');
   *       }
   *     });
   *   },
   *
   *
   * @return {[type]} [description]
   */
  function renderer() {
    return function* renderer(next) {

      if (app._.isUndefined(this.controller) ||
        app._.isUndefined(this.controller._render)) {
        return yield next;
      }

      var args = this.controller._render,
          options,
          format;

      // responders used
      if (this.controller && this.controller.format) {
        format = this.controller.format;
      }

      // if render instructions object given
      if (app._.isPlainObject(args[0])) {

        options = args[0];

        if (options.template || options.view) {

          return yield this.render((options.template || options.view), this.locals);

        } else if (format) {

          // set type if not set already
          if (!this.type) {
            this.type = format;
          }

          // if options has format key, use that as the body
          if (app._.has(options, format) && format !== 'html') {
            this.body = options[format];
          } else if (app._.has(options, 'raw')) {
            this.body = options.raw;
          }
        }
      } else if (app._.isString(args[0])) {

        template = args[0];
        options = app._.isPlainObject(args[1]) ? args[1] : {};

        if (template === false) {

          this.response.nothing = true;
          this.body = '';
          this.type = 'text/plain';

        }

        if (options.format) {

          // if format option, use template with format suffix name.{format}.ext
          template += '.' + options.format;
          return yield this.render(template);

        } else if (format) {
          // format was negotiated, assume this string is the raw content
          this.body = template;
          this.type = format;

          return yield next;

        }

      }
      return yield next;
    }
  }
};