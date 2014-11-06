/**
 * Module dependencies.
 */
var http= require('http')
var fs= require('fs');

/**
 * Expose `error`.
 */

module.exports= error;

/**
 * Error middleware for EJS.
 *
 * @param {Object} opts
 *  `custom` Object views for a status, for example: 
 *    {
 *      404: 'error/not-found'
 *    }
 *  `view` String default error view. Defaults to {view.root}/error
 *  `layout` String|Boolean layout to use on error view, or false if none. False by default.
 */
function error(opts) {
  //define your custom views
  opts = opts || {};
  //custom views
  if(!opts.custom)
    opts.custom={};
  // better to disable layout in not explicity set, in case there are error in it
  if(!opts.layout)
    opts.layout= false;
  // @todo to be easier to install, should render from this module path
  if(!opts.view)
    opts.view= 'error';

  return function *error(next){
    var env= this.app.env;
    try {
      yield next;
      if (this.response.status==404 && !this.response.body) 
        this.throw(404);
    } catch (err) {
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      // accepted types
      switch (this.accepts('html', 'text', 'json')) {
        case 'text':
          if (env==='development') 
            this.body= err.message
          else if (err.expose) 
            this.body= err.message
          else 
            this.body= http.STATUS_CODES[this.status];
          break;

        case 'json':
          if (env==='development') 
            this.body= {error: err.message}
          else if (err.expose) 
            this.body= {error: err.message}
          else 
            this.body= {error: http.STATUS_CODES[this.status]}
          break;

        case 'html':
            var view= typeof opts.custom[this.status]!=='undefined' ? opts.custom[this.status] : opts.view;
            var options= {
              layout: opts.layout,
              env: env,
              ctx: this,
              request: this.request,
              response: this.response,
              error: err.message,
              stack: err.stack,
              status: this.status,
              code: err.code
            };
            //in case of any error view error
            try{
              yield this.render(view, options);
            }catch(e){
              this.body= '<h1>'+e.code+'</h1><h3>'+e.message+'</h3><pre><code>'+e.stack+'</code></pre>'
            }
          break;
      }
    }
  }
}
