var path = require('path');
var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var koa = require('koa');
var Kona = require(__filename.replace(/.test/g, ''));

describe("Kona", function() {

  it('is a constructor', function() {

    expect(Kona).to.be.a('function');

  });

  describe('constructor', function() {

    var app;

    beforeEach(function() {
      app = new Kona();
    });

    it('default to NODE_ENV environment or "development"', function() {
      var nodeEnv = process.env.NODE_ENV,
          app2, app3;
      expect(app.env).to.eq(nodeEnv);
      process.env.NODE_ENV = 'production'
      app2 = new Kona();
      expect(app2.env).to.eq('production');
      delete process.env.NODE_ENV;
      app3 = new Kona();
      expect(app3.env).to.eq('development');
      process.env.NODE_ENV = nodeEnv;
    });

    it('configures itself', function() {
      expect(app.config).to.be.an('object');
    });

    it('extends Koa', function( ){
      expect(app).to.be.an.instanceof(koa);
    });

  });

  describe('#bootstrap', function() {

    var app,
        LivePath = require(path.join(__dirname.replace('test', ''), 'support')).LivePath;

    beforeEach(function() {

      app = Object.create(Kona.prototype);
      app.bootstrap({});

    });

    it('creates a LivePath of the process.cwd root', function() {
      expect(app.root).to.be.an.instanceof(LivePath);
      expect(app.root.toString()).to.eql(process.cwd());
    });

    it('creates a LivePath of the Kona module root', function() {
      expect(app.root).to.be.an.instanceof(LivePath);
    });

    it('reads the version from the package.json', function() {
      expect(app.version).to.eq(require('../../package').version);
    });

    it('instantiates a logger', function() {

      expect(app.log).to.be.a('object');
      ['info', 'error', 'warn'].forEach(function(level) {
        expect(app.log[level]).to.be.a('Function');
      });

    })

    it('calls #mountBaseModules', function() {

      var spy = sinon.spy(Object.getPrototypeOf(app), 'mountBaseModules');
      app.bootstrap({});
      expect(spy).to.have.been.called;

    });

  });

  describe('#console', function() {

    it('doesn\'t explode', function() {

      var app = new Kona(),
          repl;
      expect(function() {
        repl = app.console();
      }).to.not.throw(Error);
      repl.close();

    });

  });

  describe('#listen', function() {

    it('starts a node http server', function() {

      var app = new Kona(),
          server = app.listen(9999);

      expect(server).to.be.truthy;

      server.close();

    });

    it('starts a server', function() {

      var app = new Kona(),
          server;

      server = app.listen(9999);

      expect(server).to.be.an.instanceof(require('http').Server);

      server.close();

    });

  })

});