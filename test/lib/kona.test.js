var path = require('path');
var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var koa = require('koa');
var Kona = require(__filename.replace(/.test/g, ''));
var co = require('co');

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

    it('configures itself', function(done) {
      var app = new Kona().on('ready', function() {
        expect(this.config).to.be.an('object');
        done();
      });
    });

    it('extends Koa', function( ){
      expect(app).to.be.an.instanceof(koa);
    });

  });

  describe('#bootstrap', function() {

    var app,
        promise,
        LivePath = require(path.join(__dirname.replace('test', ''), 'support')).LivePath;

    beforeEach(function() {
      app = Object.create(Kona.prototype);
      promise = co.wrap(app.bootstrap).call(app, {});
    });

    it('creates a LivePath of the process.cwd root', function(done) {
      promise.then(function() {
        expect(app.root).to.be.an.instanceof(LivePath);
        expect(app.root.toString()).to.eql(process.cwd());
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('creates a LivePath of the Kona module root', function(done) {
      promise.then(function() {
        expect(app._root).to.be.an.instanceof(LivePath);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('reads the version from the package.json', function(done) {
      promise.then(function() {
        expect(app.version).to.eq(require('../../package').version);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('instantiates a logger', function(done) {

      promise.then(function() {
        expect(app.log).to.be.a('object');
        ['info', 'error', 'warn'].forEach(function(level) {
          expect(app.log[level]).to.be.a('Function');
        });
        done();
      }).catch(function(err) {
        done(err);
      });

    });

    it('calls #mountBaseModules', function(done) {
      var app = Object.create(Kona.prototype),
          spy = sinon.spy(Object.getPrototypeOf(app), 'mountBaseModules');
      co.wrap(app.bootstrap).call(app, {}).then(function() {
        expect(spy).to.have.been.called;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('#console', function() {

    it('doesn\'t explode', function(done) {
      var repl;
      new Kona({}, function() {
        expect(function() {
          repl = this.console();
        }.bind(this)).to.not.throw(Error);
        repl.close();
        done();
      });
    });

  });

  describe('#listen', function() {

    it('starts a node http server', function(done) {

      new Kona({}, function() {
        var server = this.listen(9999);

        expect(server).to.be.truthy;

        server.close();

        done();
      });

    });

    it('starts a server', function(done) {

      new Kona({}, function() {
        var server;

        server = this.listen(9999);

        expect(server).to.be.an.instanceof(require('http').Server);

        server.close();

        done();
      });

    });

  })

});