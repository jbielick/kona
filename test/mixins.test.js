var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.resolve(__filename.replace(/.test/g, '')));
var co = require('co');
var fs = require('fs');

describe("#loadMixins", function() {

    var manifest = {
      dependencies: {
        'kona-mixinone': '^1.0.0',
        'kona-mixin-two': '~>0.1.7',
        'not-a-mixin': '=0.0.1'
      }
    },
    readFileSync,
    app;

  beforeEach(function() {
    app = new Kona();
    readFileSync = sinon.stub(fs, 'readFileSync').returns(JSON.stringify(manifest));
  });

  afterEach(function() {
    readFileSync.restore();
  });

  it('calls #requireMixin for modules matching kona-*', function() {

    var requireSpy = sinon.stub(app, 'requireMixin');
    var manifestPath = 'path/to/manifest.json';

    app.loadMixins(manifestPath);
    expect(readFileSync).to.have.been.calledWith(manifestPath);

    expect(requireSpy).to.have.been.calledWith('kona-mixinone');
    expect(requireSpy).to.have.been.calledWith('kona-mixin-two');

    expect(requireSpy).to.have.callCount(2);

  });

});


describe("#requireMixin", function() {

  var app;

  beforeEach(function() {
    app = new Kona();
  });

  it('calls the required method on the module if exists', function() {

    co.required = sinon.spy();

    app.requireMixin('co');

    expect(co.required).to.have.been.calledWith(app);

  });

});