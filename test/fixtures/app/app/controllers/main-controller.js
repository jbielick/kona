var ApplicationController = require('./application-controller');

var MainController = ApplicationController.extend({
  home: function* (ctx) {
    console.log('hello')
  },
  show: function* (ctx) {
    yield this.respondTo({
      html: function*() {
        this.render(this.params.path);
      }
    });
  }
});

module.exports = MainController;