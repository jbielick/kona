var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.join(__dirname.replace('test', ''), '..', 'kona'));
var BaseController = require(__filename.replace(/.test/g, ''));

describe('BaseController', function() {
  var kona;

  beforeEach(function() {
    kona = new Kona();
  });

  describe('#set', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {request: {}, router: {}};
      controller = new BaseController(ctx);
    });

    describe('given a key-value pair', function() {

      it('sets the value at the key to ctx.locals', function() {

        var key = 'test',
            value = {one: 'two'};
        controller.set(key, value);

        expect(controller.locals).to.include.key(key);
        expect(controller.locals[key]).to.eql(value);
        expect(ctx.locals[key]).to.eql(value);

      });

      it('sets an object map of key values paris to ctx.locals', function() {

        var object = {
          one: 'two',
          three: 'four'
        };
        controller.set(object);

        expect(controller.locals).to.include.keys(Object.keys(object));
        Object.keys(object).forEach(function(key) {
          expect(ctx.locals[key]).to.eql(object[key]);
          expect(controller.locals[key]).to.eql(object[key]);
        });

      });

      it('assigns object key value pairs to locals without overwriting existing', function() {

        var object = {
          one: 'two',
          three: 'four'
        };
        controller.locals['existing'] = true;

        controller.set(object);
        expect(controller.locals.existing).to.be.true;
        expect(ctx.locals.existing).to.be.true;

        Object.keys(object).forEach(function(key) {
          expect(ctx.locals[key]).to.eql(object[key]);
          expect(controller.locals[key]).to.eql(object[key]);
        });

      });

    })

  });

  describe('#respondTo', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {
        request: {
          accepts: function() {}
        },
        router: {},
        throw: function() {}
      };
      controller = new BaseController(ctx);
    });

    describe('when no type: *responder object is given', function() {

      it("throws a 500", function() {

        var spy = sinon.spy(controller, 'throw'),
            gen;
        gen = controller.respondTo();
        gen.next();
        expect(spy).to.be.calledWith(500);
      });

    });

    describe('when no type: *responder matches the accept type', function() {

      it("throws a 406", function() {

        var spy = sinon.spy(controller, 'throw'),
            acceptStub = sinon.stub(controller.request, 'accepts').returns(false),
            htmlSpy = sinon.spy(),
            jsonSpy = sinon.spy(),
            gen;
        gen = controller.respondTo({
          html: function*() {
            htmlSpy();
          },
          json: function*() {
            jsonSpy();
          }
        });
        gen.next();
        expect(spy).to.be.calledWith(406);
        expect(htmlSpy).to.not.have.been.called;
        expect(jsonSpy).to.not.have.been.called;
      });

    });

    describe('when a type: *resopnder matches the accept type', function() {

      it('calls that responder', function() {

        var throwSpy = sinon.spy(controller, 'throw'),
            acceptStub = sinon.stub(controller.request, 'accepts').returns('json'),
            htmlSpy = sinon.spy(),
            jsonSpy = sinon.spy(),
            gen;

        gen = controller.respondTo({
          json: jsonSpy,
          html: htmlSpy
        });
        gen.next();

        expect(htmlSpy).to.not.have.been.called;
        expect(jsonSpy).to.have.been.called;
        expect(throwSpy).to.not.have.been.called;

      });

    });

  });

  describe('#respondsTo', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {request: {}, router: {}};
      controller = new BaseController(ctx);
    });

    it('adds the respond content-type to an private array', function() {

      controller.respondsTo('json');

      expect(controller._respondsTo).to.eql(['json']);

      controller.respondsTo('html');

      expect(controller._respondsTo).to.eql(['json', 'html']);

    });

  });

  describe('#respondsTo', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {request: {}, router: {}, throw: function() {}};
      controller = new BaseController(ctx);
    });

    it('stores the render call arguments for the responder', function() {

      var renderText = {text: 'hello world'},
          gen;

      controller.render(renderText, null);

      expect(controller._render).to.eql([renderText, null]);

    });

    it('throws a 500 if called more than once', function() {

      var spy = sinon.spy(controller, 'throw');

      controller.render({text: 'tick'});

      controller.render({text: 'boom'});

      controller.render({json: {id: 1}});

      expect(spy).to.have.callCount(2);

    });

  });

  describe('#{before|after}Filter', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {request: {}, router: {}};
      controller = new BaseController(ctx);
    });

    it('registers {before|after}Filter functions', function() {

      controller.beforeFilter('one');
      expect(controller._beforeFilters.length).to.eq(1);
      expect(controller._beforeFilters[0]).to.eq('one');
      controller.beforeFilter('two', 'three');
      expect(controller._beforeFilters.length).to.eq(3);
      expect(controller._beforeFilters).to.eql(['one', 'two', 'three']);

    });

  });

  describe('#call{Before|After}Filters', function() {

    var controller, ctx;

    beforeEach(function() {
      ctx = {request: {}, router: {}};
      controller = new (BaseController.extend({
        before: function*() {},
        after: function*() {}
      }))(ctx);
    });

    it('calls all before filters', function() {

      var spy = sinon.spy(controller.__proto__, 'before');
      controller.beforeFilter('before');
      var gen = controller.callBeforeFilters();
      gen.next();
      expect(spy).to.be.calledOnce;

    });

    it('calls all after filters', function() {

      var spy = sinon.spy(controller.__proto__, 'after');
      controller.afterFilter('after');
      var gen = controller.callAfterFilters();
      gen.next();
      expect(spy).to.be.calledOnce;
    });


    it('does nothing when there are no filters', function() {

      var gen, result;
      expect(controller._beforeFilters).to.be.empty;
      expect(controller._afterFilters).to.be.empty;
      gen = controller.callAfterFilters();
      result = gen.next();
      expect(result.value).to.be.undefined;
      gen = controller.callBeforeFilters();
      result = gen.next();
      expect(result.value).to.be.undefined;

    });

  });

});