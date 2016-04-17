var path = require('path');
var request = require('supertest');
var Kona = require('../lib/kona');
var fixtureAppPath = path.join(__dirname, 'fixtures', 'test-app');
var expect = require('chai').expect;

describe('integration', function() {

  var app;

  beforeEach(function(done) {
    app = new Kona({root: fixtureAppPath, environment: 'development'});
    app
      .initialize()
      .then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
  });


  it('responds with the homepage', function(done) {

    request(app.server)
      .get('/')
      .expect(200)
      .end(done);

  });

  it('sets a x-request-id header', function(done) {

    request(app.server)
      .get('/')
      .expect(200)
      .expect('X-Request-Id', /.+/)
      .end(done);

  });


  it('sets a x-request-id header', function(done) {

    request(app.server)
      .get('/')
      .expect(200)
      .expect('X-Request-Id', /.+/)
      .end(done);

  });

});