var ApplicationController = require('./application-controller');

var MainController = ApplicationController.extend({
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