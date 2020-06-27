var debug = require("debug")("kona:logger");
var winston = require("winston");
var fs = require("fs");

/**
 * @extends Kona
 *
 * methods for creatting and mounting the logger instance
 * to the appropriate file path based on the environment
 */
module.exports = {
  mountLogger: function (env) {
    this.log = this.createLogger(this.root.join("log", env + ".log"));

    this.on(
      "error",
      function (err, ctx) {
        var messages = [err.message, err.stack];
        // if (ctx) {
        //   messages.push(ctx);
        // }
        if (env === "development") {
          console.error(err.stack);
        }

        this.log.error.apply(this.log, messages);
      }.bind(this)
    );
  },

  /**
   *
   * Attempts to create a winston logger at {filePath}
   * writes to file *and* stdout if not in test env
   *
   * also logs all `error` events emitted from the app
   *
   * @param  {String} filePath the path at which to write the log
   * @return {winston.Logger}     winston logger instance
   */
  createLogger: function (filePath) {
    var logTransports = [],
      logger,
      filePath;

    try {
      debug("opening log: " + filePath);

      fs.writeFileSync(filePath, "");

      logTransports.push(new winston.transports.File({ filename: filePath }));
    } catch (e) {
      logTransports.push(new winston.transports.Console({ json: false }));
    } finally {
      logger = new winston.Logger({ transports: logTransports });
    }

    return logger;
  },
};
