var path = require('path');
var _ = require('lodash');

function BaseController() {};

BaseController.prototype.index = function() {};
BaseController.prototype.create = function() {};
BaseController.prototype.show = function() {};
BaseController.prototype.edit = function() {};
BaseController.prototype.update = function() {};
BaseController.prototype.destroy = function() {};

// BaseController.prototype.render = function(options) {
//   options || (options = {});
// };

BaseController.extend = require(path.join('..', 'extend'));

module.exports = BaseController;