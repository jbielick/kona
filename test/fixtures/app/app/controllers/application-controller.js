var RequestController = require('kona/request-controller');

var ApplicationController = RequestController.extend({

  constructor: function() {
    RequestController.apply(this, arguments);
  }

});

module.exports = ApplicationController;