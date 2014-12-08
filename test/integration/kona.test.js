var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.join(__dirname.replace('test', ''), '..', 'lib', 'kona'));

describe('Application', function() {

  var app;

  beforeEach(function() {

  });

  it('displays the home page', function(done) {
    app = new Kona({root: path.join(__dirname, 'testApp')});
    request(app.listen())
      .get('/')
      .expect(200)
      .expect(/grind/)
      .end(done);
  });

  it('displays the home page', function(done) {
    app = new Kona({root: path.join(__dirname, 'testApp')});
    request(app.listen())
      .get('/nonexistent')
      .expect(404)
      .end(done);
  });
});