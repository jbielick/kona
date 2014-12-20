var support = require('../../support');
var _ = support.Utilities;

module.exports = {

  /**
   * the render method in controller context.
   * accepts a simple String template name or an object or render instructions.
   * Options include:
   *
   *  template: 'path/to/template' -- extension necessary if not default viewExt\
   *  view: 'path/to/template'  -- (same as above)
   *  format: 'js'    -- let the autoresponder render the template, but only in this
   *                      format (file extension)
   *  nothing: true   -- respond with an empty body
   *
   * @param {Object|String} template path / name or {}
   */
  render: function* () {

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

        } else {

          if (app._.isUndefined(format)) {
            format = Object.keys(options)[0];
          }

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


  if (_.isUndefined(this._render)) {

      this._render = [].slice.call(arguments);

      return true;

    } else {

      return this.throw(500, 'Render and / or redirect called multiple times');

    }
  }


};