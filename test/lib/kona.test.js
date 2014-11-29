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

    it('accepts an environment as the second argument to constructor', function() {
      app = new Kona(null, 'dev');
      expect(app.env).to.eq('dev');
    });

    it('configures itself', function() {
      expect(app.config).to.be.an('object');
    });

    it('mounts a koa app', function( ){
      expect(app.koa).to.be.an.instanceof(require('koa'));
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

    it('sets the environment property', function() {

      var nodeEnv = process.env['NODE_ENV'];
      expect(app.env).to.eql(process.env['NODE_ENV']);

      delete process.env['NODE_ENV'];
      app.bootstrap({environment: 'test2'});
      expect(app.env).to.eql('test2');

      app.bootstrap({}, 'test3');
      expect(app.env).to.eql('test3');

      app.bootstrap({});
      expect(app.env).to.eql('development');

      process.env['NODE_ENV'] = nodeEnv;

    });

    it('instantiates a logger', function() {

      expect(app.log).to.be.a.function;
      ['info', 'error', 'warn'].forEach(function(level) {
        expect(app.log[level]).to.be.a('Function');
      });

    })

    it('calls #mount', function() {

      var spy = sinon.spy(app.__proto__, 'mount');
      app.bootstrap({});
      expect(spy).to.have.been.called;

    });

  });

  describe('#buildStack', function() {

    it('mounts middleware via koa', function() {

      var app = new Kona(),
          spy = sinon.spy(app, 'use'),
          middleWarez = app._root.join('lib', 'middleware');

      app.buildStack(app.config);
      expect(spy).to.have.callCount(fs.readdirSync(middleWarez).length + 1);

    });

  });

  describe('#loadObjects', function() {

    var app;

    before(function() {
      app = new Kona();
    });

    it('recursively loads objects and keys their exported constructors by their path');

    after(function() {
      // delete all
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

    it('calls koa.listen', function() {

      var app = new Kona(),
          spy = sinon.spy(app.koa.__proto__, 'listen'),
          server;

      server = app.listen(9999);

      expect(spy).to.have.been.calledWith(9999);

      server.close();

    });

  })

});