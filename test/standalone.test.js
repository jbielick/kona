var path = require('path');
var request = require('supertest');
var Kona = require('../kona');
var expect = require('chai').expect;

/**
 * Standalone tests:
 * without a generated, backing application directory structure,
 * the kona app should still be usable
 */
describe('running the server', function() {

  var app;

  beforeEach(function() {
    app = new Kona({environment: 'development'});
  });

  describe('when requesting /', function() {

    it('throws a 404', function(done) {

      app
        .initialize()
        .then(function(app) {

        request(app.server)
          .get('/')
          .expect(404)
          .end(done);

      });
    });

  });

});