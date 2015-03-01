var path = require('path');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));
var Kona = require(path.join(__dirname.replace('test', ''), 'kona'));
var appPath = path.join(__dirname, '..', 'fixtures', 'test-app');

describe('Application', function() {

  var app;

  beforeEach(function() {
    app = new Kona({root: appPath});
  });

  it('displays the home page', function(done) {

    app.initialize().on('ready', function() {

      request(this.listen())
        .get('/')
        .expect(200)
        .expect(/grind/)
        .end(done);

    });
  });

  it('displays the home page', function(done) {

    app.initialize().on('ready', function() {

      request(this.listen())
        .get('/nonexistent')
        .expect(404)
        .end(done);

    });
  });

});