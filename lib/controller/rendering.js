var join = require('path').join;
var support = require(join(__dirname, '..', 'support'));
var _ = support.Utilities;

module.exports = {

  /**
   * simply write the argument[0] to the response body
   * all template / advanced rendering is done in kona-rendering
   *
   * @param {Mixed} data          data to set to ctx.body
   * @param {String} options       options including type: 'content-type' to
   *                               to set to ctx.type
   */
  render: function* (context, options) {

    if (this.body) {
      return this.throw(500, 'Render and / or redirect called multiple times');
    }

    options || (options = {});

    if (options.type) {
      this.type = options.type;
    }

    return this.body = data;

  }

};