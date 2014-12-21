var path = require('path');

var ApplicationController = kona.Controller.Base.extend({

  constructor: function() {
    kona.Controller.Base.apply(this, arguments);
  }

});

module.exports = ApplicationController;