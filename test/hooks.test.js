var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require('../kona');
var co = require('co');

describe('#hookFor', function() {

  describe('with one hook registered', function() {

    it('yields to the event handler', function(done) {

      var app = new Kona(),
          spy1 = sinon.spy(),
          spy2 = sinon.spy(),
          error;

      app.on('hook:one', function* () { spy1(); });
      app.on('hook:two', function* () { spy2(); });

      co(function* () {
        try {
          yield app.hookFor('one');
        } catch (e) {
          error = e;
        }
      }).catch(function(err) {

        done(err);

      }).then(function() {

        expect(spy1).to.have.been.called;
        expect(spy2).to.not.have.been.called;

        co(function* () {
          try {
            yield app.hookFor('two');
          } catch (e) {
            error = e;
          }
        }).catch(function(err) {

          done(err);

        }).then(function() {

          expect(spy2).to.have.been.called;
          done();

        });

      });

    });
  });

  describe('with multiple hooks registered', function() {

    it('yields to the event handlers in order of reigstering', function(done) {

      var app = new Kona(),
          spy1 = sinon.spy(),
          spy2 = sinon.spy(),
          error;

      app.on('hook:one', function* () { spy1(); });
      app.on('hook:one', function* () { spy2(); });

      co(function* () {
        try {
          yield app.hookFor('one');
        } catch (e) {
          error = e;
        }
      }).catch(function(err) {

        done(err);

      }).then(function() {

        expect(spy1).to.have.been.called;
        expect(spy2).to.have.been.called;
        expect(spy1).to.have.been.calledBefore(spy2);
        done();

      });

    });

  });

});