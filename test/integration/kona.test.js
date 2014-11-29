var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var koa = require('koa');
var Kona = require(path.join(__dirname.replace('test', ''), '..', 'lib', 'kona'));

describe('Application', function() {
  it('404s without a generated application', function(done) {
    var app = new Kona();
    request(app.listen())
      .get('/')
      .expect(404)
      .end(done);
  });
});