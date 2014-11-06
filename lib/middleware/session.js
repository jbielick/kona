var session = require('koa-session');

module.exports = function(app) {  
  app.keys = ['apwioejfpowaijef'];
  app.use(session());
}