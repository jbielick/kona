var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Koa = require('koa');
chai.use(require('sinon-chai'));
var autoresponder = require(__filename.replace(/test(\.|\/)/g, ''));
var _ = require('lodash');

describe('autoresponder', function () {

  var action = 'home',
      renderSpy = sinon.spy(),
      router,
      app;

  beforeEach(function() {

    app = new Koa();

    app._ = _;

    router = {};

    // stub the route match and controller before autoresponder middleware
    app.use(function* (next) {

      this.router = router;

      this.render = function* () {
        renderSpy();
        return 'rendered';
      }

      yield next;
    });

    app.on('error', function(e) {
      console.log(e.message, e.stack);
    });

  });

  it('invokes the action on the mounted controller', function(done) {

    router.match = {
      controller: 'main',
      action: 'home'
    };

    app.use(function* (next) {
      // mount a controller stub
      this.controller = sinon.mock();
      yield next;
    });

    autoresponder(app);

    app.use(function* (next) {
      yield next;
    });

    request(app.listen())
      .get('/')
      .expect(404)
      .end(done);

  });

  it('yields next if the body already has content', function(done) {

    var downstreamSpy = sinon.spy();
    var renderSpy = sinon.spy();

    router.match = {
      controller: 'main',
      action: 'home'
    };

    app.use(function* (next) {
      this.body = 'hello';
      this.controller = sinon.mock();
      return yield next;
    });

    autoresponder(app);

    app.use(function* (next) {
      return yield next;
    });

    request(app.listen())
      .get('/')
      .expect('hello')
      .end(function(err) {
        expect(renderSpy).to.not.haveBeenCalled;
        expect(downstreamSpy).to.haveBeenCalled;
        done(err);
      });

  });

});