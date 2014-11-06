var koa = require('koa')
var koa_barista = require('../index')
var app = koa()

// Add routes

var router = new koa_barista({
  directory: __dirname + '/routes/'
})

// See barista to learn how to add routes

router.match('/profiles/:username', 'GET')
      .to('user.show')

// Apply stuff

app.use(router.callback())

app.listen(1337)

console.log('Server is running on 1337')