var Controller = require('kona/lib/controller/request');

var ApplicationController = Controller.extend({

  constructor: function() {
    Controller.apply(this, arguments);
  }

});

module.exports = ApplicationController;