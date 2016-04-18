/**
 * attaches log request profile middleware that uses the application logger
 * @param  {Application} app kona app instance
 */
module.exports = function(app) {
  app.use(function* logger(next) {
    var key = this.method + ' ' + this.originalUrl + ' ' + this.id;
    app.log.profile(key);
    yield next;
    app.log.profile(key);
  });
}
