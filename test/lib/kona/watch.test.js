var chai = require('chai');
var expect = chai.expect;
var Kona = require('../../../lib/kona');
var sinon = require('sinon');
var chokidar = require('chokidar');
chai.use(require('sinon-chai'));
var path = require('path');
var options = {}
var fs = require('fs');
var exec = require('child_process').exec;

var watchablePath = '/tmp/watchable.txt';

describe('Extension: watch', function() {

  var app;

  beforeEach(function() {
    app = new Kona();
  });

  afterEach(function() {
    exec('rm ' + watchablePath);
  });

  it('exposes #watch', function() {
    expect(app.watch).to.be.a('Function');
  });

  describe('#watch', function() {

    it('watches a path and registers an onchange handler', function() {

      var onSpy = {on: sinon.spy()},
          watchSpy = sinon.stub(chokidar, 'watch').returns(onSpy);

      app.watch('/test', function() {});

      expect(watchSpy).to.have.been.calledWith('/test');
      expect(onSpy.on).to.have.been.calledWith('change');

    });

  });

  describe('#watchModules', function() {

    it('calls #watch on each path provided', function() {

      var paths = ['./', '../', '../../'],
          watchSpy = sinon.stub(Object.getPrototypeOf(app), 'watch');

      app.watchModules(paths);

      expect(watchSpy).to.have.callCount(paths.length);

      watchSpy.restore();

    });

    it('calls #watch on the config.autoloadPaths targets', function() {

      var app = new Kona(),
          spy = sinon.stub(Object.getPrototypeOf(app), 'watch');

      app.configure();

      app.watchModules(app.config.autoloadPaths);
      expect(spy).to.have.callCount(app.config.autoloadPaths.length);

    });

  });

});