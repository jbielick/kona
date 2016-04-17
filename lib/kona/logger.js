var debug = require('debug')('kona:logger');
var winston = require('winston');
var fs = require('fs');

/**
 * @extends Kona
 *
 * methods for creatting and mounting the logger instance
 * to the appropriate file path based on the environment
 */
module.exports = {

  mountLogger: function(env) {
    if (this.log) {
      return this.log;
    }

    var logger = this.log = new winston.Logger(this.config.logger);

    debug('logger mounted');

    this.on('error', function(err, ctx) {
      logger.error(err.stack, ctx.req.toJSON());
    });

  }

};