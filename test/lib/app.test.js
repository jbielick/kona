var path = require('path');
var request = require('supertest');
var Kona = require(path.join(__dirname.replace('test', ''), 'kona'));
var appPath = path.join(__dirname, '..', 'fixtures', 'test-app');

describe('in a test application fixture', function() {

  var app;

  beforeEach(function() {
    app = new Kona({root: appPath});
  });

  describe('when requesting /', function() {
    it('displays the home page', function(done) {

      app.initialize().on('ready', function() {

        request(this.server)
          .get('/')
          .expect(200)
          .expect(/grind/)
          .end(done);

      });
    });

  });

  describe('when requesting an undefined route', function () {

    it('displays the 404 page', function(done) {

      app.initialize().on('ready', function() {

        request(this.server)
          .get('/nonexistent')
          .expect(404)
          .expect(/no route found/i)
          .end(done);

      });
    });
  });

});