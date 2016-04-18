var chai = require('chai');
var expect = chai.expect;
var Kona = require('../kona');
var exec = require('child_process').exec;
var Logger = require('winston').Logger;
var path = require('path');

describe('Extension: logger', function() {

  var app;

  beforeEach(function(done) {
    app = new Kona();
    app
      .initialize()
      .then(function() {done();})
      .catch(done);
  });

  describe('#mountLogger', function() {

    it('exposes log methods', function() {
      var logMethods = ['info', 'error', 'warn', 'verbose'];
      expect(app.log).to.include.keys(logMethods);
      logMethods.forEach(function(level) {
        expect(app.log[level]).to.be.a('Function');
      });
    });

    it('creates the log file if not exists', function() {
      expect(app.log.transports).to.include.keys('file');
      expect(app.log.transports.file.filename).to.eq(path.basename(app.env + '.log'));
    });

    it('returns a winston.Logger instance', function() {
      expect(app.log).to.be.an.instanceof(Logger);
    });

  });

});