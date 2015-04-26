var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Koa = require('koa');
chai.use(require('sinon-chai'));
var dispatcher = require(__filename.replace(/test(\.|\/)/g, ''));
var stubControllerPath = path.resolve(__dirname, '../../fixtures/test-controller');
var StubController = require(stubControllerPath);

describe('dispatcher', function () {

  var controller = 'main',
      action = 'home',
      joinStub = sinon.stub(),
      router,
      app;

  beforeEach(function() {

    app = new Koa();

    router = {};

    // stub the route match before dispatcher middleware
    app.use(function* (next) {
      this.router = router;
      return yield next;
    });

    // stub the root.join
    app.root = {
      join: joinStub.returns(stubControllerPath)
    };

    app.on('error', function(e) {
      console.log(e.message, e.stack);
    });

  });

  it('invokes the action on the mounted controller', function(done) {

    var mounted;

    router.match = {controller: 'main', action: 'home'};

    dispatcher(app);

    app.use(function* (next) {
      mounted = this.controller;
      this.body = 'done';
      yield next;
    });

    request(app.listen())
      .get('/')
      .expect('done')
      .end(function(err) {
        expect(mounted).to.be.an.instanceof(StubController);
        expect(joinStub).calledWithExactly(
          'app', 'controllers', '.', 'main-controller'
        )
        done(err);
      });

  });

  it('throws if no route is matched', function(done) {

    var throwSpy = sinon.spy();
    var downstreamSpy = sinon.spy();

    app.use(function* (next) {

      this.throw = throwSpy;

      return yield next;

    });

    dispatcher(app);

    app.use(function* (next) {
      downstreamSpy();
      return yield next;
    });

    request(app.listen())
      .get('/')
      .expect(404)
      .end(function(err) {
        expect(throwSpy).calledWith(404);
        expect(downstreamSpy).to.not.haveBeenCalled;
        done(err);
      });

  });

});