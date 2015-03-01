var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.resolve(__filename.replace(/.test/g, ''), '..'));
var co = require('co');
var fs = require('fs');

describe("#loadMixins", function() {

    var mixins = [
      'kona-mixinone',
      'kona-mixin-two',
      'not-a-mixin'
    ],
    existsStub,
    readdirStub,
    statSyncStub,
    app;

  beforeEach(function() {

    app = new Kona();

    existsStub = sinon.stub(fs, 'existsSync').returns(true);
    readdirStub = sinon.stub(fs, 'readdirSync').returns(mixins);
    statSyncStub = sinon.stub(fs, 'statSync').returns({isDirectory: function() { return true; }});

  });

  afterEach(function() {

    readdirStub.restore();
    existsStub.restore();
    statSyncStub.restore();

  });

  it('calls #requireMixin for modules matching kona-*', function() {

    var requireSpy = sinon.stub(app, 'requireMixin');

    app.loadMixins('path/to/modules');
    expect(readdirStub).to.have.been.calledWith('path/to/modules');

    mixins.forEach(function(mixin) {
      if (/^kona\-.*/i.test(mixin)) {
        expect(statSyncStub).to.have.been.calledWith('path/to/modules/' + mixin);
        expect(requireSpy).to.have.been.calledWith('path/to/modules/' + mixin);
      }
    });

    expect(requireSpy).to.have.callCount(mixins.length - 1);

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