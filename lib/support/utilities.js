var _ = require('lodash');
var inflector = require('underscore.inflections');

_.mixin(inflector);

_.mixin({
  toController: function(name) {
    name = name.toLowerCase() !== 'main' ? this.pluralize(name) : name;
    return this.camelize(this.underscore(name) + 'Controller');
  }
});

module.exports = _;