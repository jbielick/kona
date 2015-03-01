var join = require('path').join;
var support = require(join(__dirname, '..', 'support'));
var _ = support.Utilities;
/**
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
 */
module.exports = {

  /**
   * given a map of format => generator func, will call the correct
   * generator function according to the accepts type of the request.
   * Uses negotiator and responds in order of the types defined in the formatMap
   * object once it reaches one that the request accepts.
   * If no type is found that the request accepts, a 406 is thrown.
   * @param {Object} formatMap an object map of format (shorthand) 'json', 'html'
   *                           with a value being the generator function to be
   *                           called to respond to the request.
   * @return {*} the result of the yield to controller respond generator or
   *                 the 406.
   */
  respondTo: function* (formatMap) {

    var responder = null,
        acceptable;

    if (!_.isPlainObject(formatMap)) {
      return this.throw(500, 'Argument given to #respondTo is not an object');
    }

    if (this.router.match && this.router.match.format) {
      acceptable = this.router.match.format;
    }

    if (!acceptable) {
      acceptable = this.request.accepts(Object.keys(formatMap));
    }

    if (acceptable && _.isFunction(formatMap[acceptable])) {

      this.responder = formatMap[acceptable];
      this.format = acceptable;

      return yield this.responder.call(this);

    } else {

      return this.throw(406);

    }
  },


  /**
   * register the format / types this controller responds to when response
   * is delegated to the autoresponder
   *
   * @return {String} mime short-type ex. 'json', 'html'
   */
  respondsTo: function() {

    var types = [].slice.call(arguments);

    this._respondsTo || (this._respondsTo = []);

    if (types.length) {
      this._respondsTo = this._respondsTo.concat(types);
    }

    return this._respondsTo;
  },


  /**
   * use the autoresponder's registered respondsTo mimes to negotiate contenttype
   * of the request and respond appropriately with the object provided.
   *
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  respondWith: function* (object) {

    var responders = {};

    this.respondsTo().forEach(function(type) {

      if (type === 'html') {
        // delegate to the autoresponder
        responders[type] = function* () {}

      } else {

        responders[type] = function* () {
          this.body = yield this.constructor.getRenderer(type)(object);
        };

      }
    });

    return yield this.respondTo(responders);
  }

};