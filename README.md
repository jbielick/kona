kona
====

[![Node Version](https://img.shields.io/badge/node.js-%3E=_0.11-green.svg)](http://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/kona.svg)](https://www.npmjs.com/package/kona)
[![Build Status](https://travis-ci.org/jbielick/kona.svg?branch=master)](https://travis-ci.org/jbielick/kona)
[![Coverage Status](https://img.shields.io/coveralls/jbielick/kona.svg)](https://coveralls.io/r/jbielick/kona)
![Dependencies](https://david-dm.org/jbielick/kona.svg)
[![Join the chat at https://gitter.im/jbielick/kona](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jbielick/kona?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

What is it?
----

Kona is currently under development, but is published on [NPM](https://www.npmjs.com/package/kona) and on the road to 1.0.

Kona is micro MVC application framework that puts the tools in your hands to get up and running fast. It's mission is to make developing really fast Node.js applications fun and productive, leveraging the generator-based middleware transport offered by [Koa](koajs/koa).

Kona's focus is simplicity; it's a thin layer of the application structure you're used to with room for growing.
There aren't a million configurations (yet), you can't swap out the core middleware, you don't need 5 json documents to tell it how to start. The core of framework stack is [Koa.js](https://github.com/koajs/koa) and the middleware
stack in Kona is made up of vetted, simple, efficient and modular components. Not sure how Koa works?
[Kick-Off-Koa](https://github.com/koajs/kick-off-koa) may help.

Kona uses ES6 [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) -- part of the
ECMAScript 6 draft-standard. This allows your controller (and other) code to perform asynchronous tasks
while writing your code _as if it were synchronous_. A database query function is as simple as
`var users = yield User.findAll();`. Make sure to checkout the [Koa workshop](https://github.com/koajs/workshop)
or [this helpful video](http://knowthen.com/episode-2-understanding-javascript-generators/)
if you're new to generators.


Getting Started:
----

You'll need [Yeoman](http://yeoman.io/generators/) to generate a new kona application. The `-g` option tells npm to install it globally so you can use the command-line interface and interact with the kona generator. Next, you'll need [generator-kona](https://github.com/jbielick/generator-kona) so Yeoman can generate the kona application code. Install this globally as well with the `-g` option so Yeoman can find it.

You can install them together like this:

`> npm install -g yo generator-kona`

Now you've got yeoman and the kona application generator. Just generate a new
kona application to get started.

`> yo kona myNewApp`

The kona application generator will build an application in the directory `./myNewApp`.
It will then run `npm install` and `bower install` to install the server and client
dependencies you need to run your new application.

Now let's enter the the app directory with `cd myNewApp`.

You're ready to go!

To start the kona application, just use the npm script or `node` with the `--harmony` flag to start the server:

`npm start` or `node --harmony app.js`.

![example app generation][cli]

[cli]: http://i.imgur.com/Mbf0jWz.gif "Getting Started: Generate a kona application"


Environment
----

The application will start in `development` environment by default.

To set the application to start in another environment, use an environmental variable like this
`NODE_ENV=production`.


Routing
----

Kona uses [barista](https://github.com/kieran/barista) for routing.

The features available there are fully-exposed in the `config/routes.js` file. The routes file
exports a function that accepts the application's router as an argument. All barista methods
can be called on the router object that is passed into the `drawRoutes` function.

When mapping a route to a controller and action, use the barista pattern `controllerName.actionName`.
The dispatcher will use this path to resolve the controller and direct the request to the appropriate action.

When mapping a route to a nested (extended) controller, you can use `/` to indicate the nesting location of the controller the request should be dispatched to.

For example:

If your application had a directory structure like this:

```
  app/
    controllers/
      geographies-controller.js
      geographies/
        countries-controller.js
  ...
```

and `CountriesController.js` extended `GeographiesController` like this:

```js
// app/controllers/geographies/countries-controller.js

var GeographyController = require('../geographies-controller');

var CountriesController = GeographiesController.extend({
  index: function* () {
    var countries = yield this.Countries.find({}).toArray();
    yield this.respondWith(countries);
  }
});
```

You can route a request to the `CountriesController#show` method like this:

```js
// config/routes.js

module.exports = function drawRoutes(router) {
  router.get('/countries/:id').to('geographies/countries.show');
}
```

Mixins
----

Take advantage of mixins to add functionality and services to your app.
By simply installing a `kona-*` mixin, it will initialize with your app and decorate your controller with the module's functionality.

Take [kona-redis](https://github.com/jbielick/kona-redis/commits?author=jbielick) for example:

In the root of your kona app, simply install the `kona-redis` module like you would any other:

`npm install -S kona-redis`

*-S will tell npm to save this dependency to our package.json*

*! You still need to be running a redis-server for this to work !*

And the next time you start your application, your application object and controller
context will now have a redis client available at `this.redis`!

Now you can use redis in your controller action as simply as:

```js

  show: function* () {
    this.set('votes', yield this.redis.get('votes'));
  },

  vote: function* () {
    yield this.redis.incr('votes');
    yield this.render({json: {votes: yield this.redis.get('votes')}})
  }

```


PubSub (WebSockets)
----

**TBD**


Model Exposure
----

**TBD**

Would models in the global scope be cool? Sure. But it’s probably not a good idea.
Models can have any name—-the global namespace would get horribly messy in big apps, and
it would allow / encourage model usage in places it ought not to be.

Models are accessible as singular, PascalCase getters from the controller's `this` context.
You can perform a query or model constructor method right inside the controller action like this:

```js

// foo-controller.js

index: function* () {

  // mongo.users.find() is a function that returns a promise object
  var users = yield this.mongo.users.find().toArray();

  // respond to the request
  this.respondTo({
    json: function* () {
      this.render({json: users});
    },
    html: function* () {
      this.set('users', users);
    }
  })
}
```

`this.mongo` is an accessor added by the `kona-mongo` module decoration.

**/TBD**

Autoloading
----

In `development`, Kona’s controller / module loading mimics class autoloading — that is, it doesn’t eager load any modules until they are needed. Once required, they are cached and that cache is invalidated when the file is changed.

In `production`, all modules are loaded and cached during the application initialization.

You can change the autoloading behavior in dev to work like production by setting `config.eagerLoadModules = true;`.

You can also add more files to the autoload watch list by pushing relative paths onto the `config.autoloadPaths` array. ex: `config.autoloadPaths.push('app/services');`

Directory Structure
----

The application directory structure in kona is just like Rails'.

Views are stored in the `app/views` directory and nested by their namespace.

Controllers are stored in `app/controllers` directory and can also be nested.

```
app/
  controllers/
    main-controller.js
    user-controller.js
    user/
      admin-controller.js -- AdminController extends UserController
    foo-controller.js
    foo/
      bar-controller.js -- where BarController extends FooController
  views/
    user/
      index.html
      show.html
      add.html
      edit.html
      admin/
        manage.html
    main/
      home.html
```

Contributing
----

Pull Requests are welcome.
Run the tests with `make test`
Coverage report is in `./coverage`

Benchmarks
----

```
%benchmarks
siege
  --benchmark
  --log=./benchmark/siege.log
  --quiet
  --concurrent=500
  --time=20s
  http://localhost:3001?foo=bar&baz[qux]=souix
  &>/dev/null

Lifting the server siege...-      done.

Transactions:		       16386 hits
Availability:		       98.98 %
Elapsed time:		       19.74 secs
Data transferred:	       10.88 MB
Response time:		        0.57 secs
Transaction rate:	      830.09 trans/sec
Throughput:		        0.55 MB/sec
Concurrency:		      472.83
Successful transactions:           0
Failed transactions:	         169
Longest transaction:	        0.77
Shortest transaction:	        0.00


%endbenchmarks
```
