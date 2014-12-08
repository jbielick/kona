var _ = require('lodash');
var inflector = require('underscore.inflections');

_.mixin(inflector);

_.mixin({
  toController: function(name) {
    return this.camelize(this.pluralize(name)) + 'Controller';
  }
});

module.exports = _;