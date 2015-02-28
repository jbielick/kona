var path = require('path');

module.exports = function(app) {
  var options = {};
  if (app.inApp) {
    options.template = 'errors/error';
  }
  app.use(error(options));
}

function error(opts) {
  opts = opts || {};

  // template
  var path = opts.template || __dirname + '/error';

  // env
  var env = process.env.NODE_ENV || 'development';

  return function *error(next) {
    try {
      yield next;
      if (404 == this.response.status && !this.response.body) this.throw(404);
    } catch (err) {
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      // accepted types
      switch (this.accepts('html', 'text', 'json')) {
        case 'text':
          if ('development' == env) this.body = err.message
          else if (err.expose) this.body = err.message
          else throw err;
          break;

        case 'json':
          if ('development' == env) this.body = { error: err.message }
          else if (err.expose) this.body = { error: err.message }
          else this.body = { error: http.STATUS_CODES[this.status] }
          break;

        case 'html':
          yield this.render(path, {
            kona: kona,
            env: env,
            error: err,
            ctx: this,
            request: this.request,
            response: this.response,
            message: err.message,
            stack: err.stack,
            status: this.status,
            code: err.code
          });
          break;
      }
    }
  }
}