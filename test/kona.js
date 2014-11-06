var request = require('supertest');
var statuses = require('statuses');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var http = require('http');
var Kona = require('../lib/kona');
chai.use(sinonChai);


describe("Kona", function() {
  it('is a constructor', function() {
    assert(!!Kona);
    expect(Kona).to.be.a('function');
  });
  it('configures itself', function() {
    var kona = new Kona();
    expect(kona.config).to.be.an('object');
  });
  it('starts in development environment by default', function() {
    var kona = new Kona();
    expect(kona.env).to.eq('development');
  });
  it('reads the version from the package.json', function() {
    var info = require('../package');
    var kona = new Kona();
    expect(kona.version).to.eq(info.version);
  });
  it('mounts a koa app', function( ){
    var kona = new Kona();
    expect(kona.koa).to.be.an.instanceof(require('koa'));
  });
  it('mounts middleware', function() {
    var kona = new Kona();
    var spy = sinon.spy(kona, 'use');
    kona.bootstrap();
    expect(spy).to.have.callCount(kona.middleware.length - 1);
  });
});