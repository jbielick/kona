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

    it('doesn\'t throw', function() {
      expect(function() {
        app.watch('/tmp', function() {});
      }).to.not.throw(Error);
    });

    it('calls the callback when a file changes'); //, function(done) {
      // fs.writeFileSync(watchablePath, 'test');
      // var spy = sinon.spy();
      // chokidar.watch(watchablePath, {ignoreInitial: true})
      //   .on('change', function() {
      //     console.log('called');
      //     done();
      //   });
      // setTimeout(function() {
      //   fs.writeFileSync(watchablePath, 'change');
      // }, 350)
      // // setTimeout(function() {
      // //   watcher.close();
      // //   setTimeout(function() {
      // //     expect(spy).to.be.called;
      // //     done();
      // //   }, 750);
      // // }, 1150);
    // });
  });

});