require('coffee-script')
exports.Router = require('./lib/router').Router;

var router = new exports.Router

console.log(router.toString())

return
// var Route   = require('./lib/route').Route
// var Key     = require('./lib/key').Key
// Route.parse(router, '/:controller/:action/:id(.:format)', 'GET')


// var out = Key.parse(':controller/:action')
// console.log(out)


// var route = router.match('/:controller/:action(/:id)(.:format)');

// console.log(route)

// console.log( router.url( { controller:'snow_dogs', action:'pet', format:'json' } ) )

// console.log( route.toString() )

var route = router.get('/:controller/:action(/:id(.:format))')

var u = router.url( { action:'pet', format:'json', id:7 } )

debugger

console.log( parts )

console.log( router.url( { controller:'snow_dogs', action:'pet', id:7, format:'json' } ) )
