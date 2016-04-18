var MainController = require('./controller/main-controller');

module.exports = function(router) {

  router.get('root', '/', MainController.home);
  router.get('/pages/:path', MainController.show);

}