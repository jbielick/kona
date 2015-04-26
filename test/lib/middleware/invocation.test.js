var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Koa = require('koa');
chai.use(require('sinon-chai'));
var invocation = require(__filename.replace(/test(\.|\/)/g, ''));

describe('invocation', function () {

  var action = 'home',
      beforeFiltersSpy,
      afterFiltersSpy,
      actionSpy,
      controller,
      app;

  beforeEach(function() {

    actionSpy = sinon.spy();
    beforeFiltersSpy = sinon.spy();
    afterFiltersSpy = sinon.spy();

    app = new Koa();

    controller = controller = {
      beforeFilters: function* () {
        beforeFiltersSpy()
        return yield [];
      },
      afterFilters: function* () {
        afterFiltersSpy()
        return yield [];
      }
    };

    // stub the action
    controller[action] = function* () {
      actionSpy();
      return;
    };

    // stub the route match before invocation middleware
    app.use(function* (next) {

      this.router = {
        match: {
          controller: 'main',
          action: action
        }
      };

      yield next;
    });

    app.on('error', function(e) {
      console.log(e.message, e.stack);
    });

  });

  it('invokes the action on the mounted controller', function(done) {

    app.use(function* (next) {
      this.controller = controller;
      yield next;
    });

    invocation(app);

    app.use(function* (next) {
      this.body = 'hello';
      yield next;
    });

    request(app.listen())
      .get('/')
      .expect('hello')
      .end(function(err) {
        expect(actionSpy).to.haveBeenCalled;
        expect(beforeFiltersSpy).to.haveBeenCalled;
        expect(afterFiltersSpy).to.haveBeenCalled;
        done(err);
      });

  });

  it('yields next if no controller is mounted', function(done) {

    var downstreamSpy = sinon.spy();

    app.use(function* (next) {

      delete this.controller;

      return yield next;

    });

    invocation(app);

    app.use(function* (next) {
      expect(actionSpy).to.not.haveBeenCalled;
      expect(beforeFiltersSpy).to.not.haveBeenCalled;
      expect(afterFiltersSpy).to.not.haveBeenCalled;
      return yield next;
    });

    request(app.listen())
      .get('/')
      .expect(404)
      .end(function(err) {
        expect(downstreamSpy).to.haveBeenCalled;
        done(err);
      });

  });

});