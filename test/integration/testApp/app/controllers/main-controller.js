var path = require('path');
var ApplicationController = require('./application-controller');

var MainController = ApplicationController.extend({
  constructor: function() {
    ApplicationController.apply(this, arguments);
  },
  home: function*() {},
  show: function*() {
    yield this.respondTo({
      html: function*() {
        this.render(this.params.path);
      }
    });
  }
});

module.exports = MainController;