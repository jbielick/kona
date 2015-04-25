var path = require('path');
var join = path.join;
var support = require(join(__dirname, '..', 'support'));
var _ = support.Utilities;
var filters = {};
var assert = require('assert');

function makeEventFilter(eventName) {
  /**
   * register a {eventName}Filter
   * @param {Array|String} the name of the prototype method(s) on the
   *                           the controller
   */
  filters[eventName + 'Filter'] = function() {
    var prop = '_' + eventName + 'Filters',
        methods = [].slice.call(arguments);
    this[prop] = (this[prop] || (this[prop] = [])).concat(methods);
  };

  /**
   * creates methods {eventName}Filters which returns a yieldable array
   * of filters to call
   */
  filters[eventName + 'Filters'] = function() {

    // get all filters metho deventNames at private key or
    var filters = this['_' + eventName + 'Filters'] || [];

    // return registered filters or empty array to yield to
    return filters.map(function(methodName) {

      assert(
        this[methodName],
        'Tried to yield to undefined filter method: ' + methodName
      );

      // bind the generator to the controller context
      return function* () {

        return yield this[methodName].call(this);

      }.call(this);

    }.bind(this));

  };
}

['before', 'after'].forEach(makeEventFilter);

module.exports = filters;
