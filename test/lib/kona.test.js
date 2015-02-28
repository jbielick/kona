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

    it('default to NODE_ENV environment or "development"', function() {
      var nodeEnv = process.env.NODE_ENV,
          app, app2, app3;
      app = new Kona();
      expect(app.env).to.eq(nodeEnv);
      process.env.NODE_ENV = 'production'
      app2 = new Kona();
      expect(app2.env).to.eq('production');
      delete process.env.NODE_ENV;
      app3 = new Kona();
      expect(app3.env).to.eq('development');
      process.env.NODE_ENV = nodeEnv;
    });

    it('extends Koa', function( ){
      var app = new Kona();
      expect(app).to.be.an.instanceof(koa);
    });

  });

  describe('#initialize', function() {
    it('configures itself', function(done) {
      var app = new Kona();
      app.initialize().on('ready', function() {
        expect(this.config).to.be.an('object');
        done();
      });
    });

    it('does not initialize twice', function(done) {

      var app = new Kona(),
          spy = sinon.stub(Object.getPrototypeOf(app), 'loadMiddleware');

      app.initialize().once('ready', function() {
        app.initialize();
        expect(spy).to.have.been.calledOnce;
        done();
      });

    });
  });

  describe('#bootstrap', function() {

    var app,
        promise,
        LivePath = require(path.join(__dirname.replace('test', ''), 'support')).LivePath;

    beforeEach(function() {
      app = new Kona();
    });

    it('creates a LivePath of the process.cwd root', function() {
      expect(app.root).to.be.an.instanceof(LivePath);
      expect(app.root.toString()).to.eql(process.cwd());
    });

    it('creates a LivePath of the Kona module root', function() {
      expect(app._root).to.be.an.instanceof(LivePath);
    });

    it('reads the version from the package.json', function() {
      expect(app.version).to.eq(require('../../package').version);
    });

    it('instantiates a logger', function() {
      expect(app.log).to.be.a('object');
      ['info', 'error', 'warn'].forEach(function(level) {
        expect(app.log[level]).to.be.a('Function');
      });
    });

    it('calls #mountBaseModules', function() {
      var app = Object.create(Kona.prototype),
          spy = sinon.spy(Object.getPrototypeOf(app), 'mountBaseModules');
      app.bootstrap({});
      expect(spy).to.have.been.called;
    });

  });

  describe('#console', function() {

    it('doesn\'t explode', function(done) {
      var repl,
          app = new Kona()
      app.initialize().on('ready', function() {
        expect(function() {
          repl = this.console();
        }.bind(this)).to.not.throw(Error);
        repl.close();
        done();
      });
    });

  });

  describe('#watchModules', function() {

    it('calls #watch on the config.watch targets', function(done) {

      var app = new Kona(),
          spy = sinon.spy(Object.getPrototypeOf(app), 'watch');

      app.initialize().on('ready', function() {

        app.watchModules();
        expect(spy).to.have.callCount(app.config.watch.length + 1);
        done();

      });

    });

  });

  describe('#hookFor', function() {

    it('yields to the event handlers for the "hooks:{hookname}" event', function() {

      var app = new Kona(),
          spy1 = sinon.spy(),
          spy2 = sinon.spy(),
          error;

      app.on('hook:one', function* () { spy1(); })
      app.on('hook:two', function* () { spy2(); })

      co(function* () {
        try {
          yield app.hookFor('one');
        } catch (e) {
          error = e;
        }
      });

      if (error) {throw error;}

      expect(spy1).to.have.been.called;
      expect(spy2).to.not.have.been.called;

      co(function* () {
        try {
          yield app.hookFor('two');
        } catch (e) {
          error = e;
        }
      });

      if (error) {throw error;}

      expect(spy2).to.have.been.called;
    });

  });

  describe('#listen', function() {

    it('starts a node http server', function(done) {

      var app = new Kona();

      app.initialize().on('ready', function() {
        var server = this.listen(9999);

        expect(server).to.be.truthy;

        server.close();

        done();
      });

    });

    it('throws if called before #initialize', function() {

      var app = new Kona();

      expect(function() {
        app.listen();
      }).to.throw(Error);

    });

    it('starts a server', function(done) {

      var app = new Kona();

      app.initialize().on('ready', function() {
        var server;

        server = this.listen(9999);

        expect(server).to.be.an.instanceof(require('http').Server);

        server.close();

        done();
      });

    });

  })

});