var session = require('koa-session');

module.exports = function(app) {
  app.keys = app.config.session.secrets || ['kona-session'];
  app.use(session(app.config.session, app));
}