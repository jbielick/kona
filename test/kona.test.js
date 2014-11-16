var request = require('supertest');
var statuses = require('statuses');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var http = require('http');
var koa = require('koa');
var Kona = require('../lib/kona');
var fs = require('fs');
chai.use(sinonChai);

describe("Kona", function() {
  it('is a constructor', function() {
    expect(Kona).to.be.a('function');
  });
  it('configures itself', function() {
    var kona = new Kona();
    expect(kona.config).to.be.an('object');
  });
  // it('starts in development environment by default', function() {
  //   var kona = new Kona();
  //   expect(kona.env).to.eq('test');
  // });
  it('reads the version from the package.json', function() {
    var info = require('../package');
    var kona = new Kona();
    expect(kona.version).to.eq(info.version);
  });
  it('mounts a koa app', function( ){
    var kona = new Kona();
    expect(kona.koa).to.be.an.instanceof(require('koa'));
  });
  it('mounts middleware via koa', function() {
    var spy = sinon.spy(koa.prototype, 'use');
    var kona = new Kona();
    var wares = kona._root.join('lib', 'middleware');
    expect(spy).to.have.callCount(fs.readdirSync(wares).length + 1);
  });
});