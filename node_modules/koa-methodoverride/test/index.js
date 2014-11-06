var koa = require('koa');
var parse = require('co-body');

var app = koa();

app.use(function *(next) {
  try {
    this.request.body = yield parse(this);
  } catch (e) {
    this.request.body = null;
  }
  yield next;
});

app.use(require('../')());

app.use(function *() {
  this.body = this.request.method;
});

var request = require('supertest').agent(app.listen());

describe('methodOverride()', function(){
  it('should not touch the method by default', function(done){
    request
    .get('/')
    .expect('GET', done);
  })

  it('should be case in-sensitive', function(done){
    request
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('X-HTTP-Method-Override', 'DELETE')
    .expect('DELETE', done);
  })

  it('should ignore invalid methods', function(done){
    request
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('X-HTTP-Method-Override', 'POST')
    .expect('POST', done);
  })
})
