var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.join(__dirname.replace(/test\//, ''), '..', 'kona'));
var AbstractController = require(__filename.replace(/test(\/|\.)?/g, ''));
var co = require('co');

describe('AbstractController', function() {

  describe('#set', function() {

    var controller;

    beforeEach(function() {
      controller = new AbstractController();
    });

    describe('given a key-value pair', function() {

      it('sets the value at the key to controller.locals', function() {

        var key = 'test',
            value = {one: 'two'};

        controller.set(key, value);

        expect(controller.locals).to.include.key(key);
        expect(controller.locals[key]).to.eql(value);

      });

      it('sets an object map of key values paris to controller.locals', function() {

        var object = {
          one: 'two',
          three: 'four'
        };
        controller.set(object);

        expect(controller.locals).to.include.keys(Object.keys(object));
        Object.keys(object).forEach(function(key) {
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

        Object.keys(object).forEach(function(key) {
          expect(controller.locals[key]).to.eql(object[key]);
        });

      });

    })

  });

  describe('#{before|after}Filter', function() {

    var controller;

    beforeEach(function() {
      controller = new AbstractController();
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

    var controller;

    beforeEach(function() {
      controller = new (AbstractController.extend({
        before: function*() {},
        after: function*() {}
      }))();
    });

    it('calls all before filters', function() {

      var spy = sinon.spy(Object.getPrototypeOf(controller), 'before');
      controller.beforeFilter('before');
      var gen = controller.callBeforeFilters();
      gen.next();
      expect(spy).to.be.calledOnce;

    });

    it('calls all after filters', function() {

      var spy = sinon.spy(Object.getPrototypeOf(controller), 'after');
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