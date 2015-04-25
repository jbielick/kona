var path = require('path');
var request = require('supertest');
var Koa = require('koa');
var expect = require('chai').expect;
var dispatcher = require(__filename.replace(/test./g, ''));

describe('running the server', function() {

  var app,
      router = {
        match: {
          controller: 'main',
          action: 'home'
        }
      };

  beforeEach(function() {

    app = new Koa();
    app.use(function* (next) {
      this.router = router;
      yield next;
    });
    dispatcher(app);

  });

});