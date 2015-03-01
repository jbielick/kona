var path = require('path');
var join = path.join;
var support = require(join(__dirname, '..', 'support'));
var _ = support.Utilities;
var filters = {};

function makeEventFilter(name) {
  /**
   * register a {before|after}Filter
   * @param {Array|String} the name of the prototype method(s) on the
   *                           the controller
   */
  filters[name + 'Filter'] = function() {
    var prop = '_' + name + 'Filters',
        methods = [].slice.call(arguments);
    this[prop] = (this[prop] || (this[prop] = [])).concat(methods);
  };

  /**
   * calls all registered {after|before}Filters
   */
  filters['call' + _.titleize(name) + 'Filters'] = function*() {
    var _this = this,
        filters = this['_' + name + 'Filters'];
    if (!filters) { return; }
    for (var i = filters.length - 1; i >= 0; i--) {
      yield this[filters[i]].call(_this);
    }
    return true;
  };
}

['before', 'after'].forEach(makeEventFilter);

module.exports = filters;
