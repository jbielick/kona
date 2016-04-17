var path = require('path');
var request = require('supertest');
var Kona = require(path.join(__dirname.replace('test', ''), 'kona'));
// var appPath = path.join(__dirname, '..', 'fixtures', 'test-app');
var expect = require('chai').expect;

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