var chai = require('chai');
var expect = chai.expect;
var Kona = require('../../../lib/kona');
var exec = require('child_process').exec;
var Logger = require('winston').Logger;
var path = require('path');

var logPath = '/tmp/kona.log';

describe('Extension: logger', function() {

  var app;

  beforeEach(function() {
    app = new Kona();
    exec('rm ' + logPath);
  });

  afterEach(function() {
    exec('rm ' + logPath);
  });

  it('exposes #createLogger', function() {
    expect(app.createLogger).to.be.a('Function');
  });

  describe('#createLogger', function() {

    it('exposes a #log method', function() {
      app.createLogger(logPath);
      expect(app.log).to.include.keys('info', 'error', 'warn', 'verbose');
    });

    it('creates the log file if not exists', function() {
      var logger = app.createLogger(logPath);
      expect(logger.transports).to.include.keys('file');
      expect(logger.transports.file.filename).to.eq(path.basename(logPath));
    });

    it('returns a winston.Logger instance', function() {
      expect(app.createLogger(logPath)).to.be.an.instanceof(Logger);
    });
  });

});