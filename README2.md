kona
====

[![Node Version](https://img.shields.io/badge/node.js-%3E=_0.11-orange.svg)](http://nodejs.org)
[![Build Status](https://travis-ci.org/jbielick/kona.svg)](https://travis-ci.org/jbielick/kona)
[![Coverage Status](https://img.shields.io/coveralls/jbielick/kona.svg)](https://coveralls.io/r/jbielick/kona)


What is it?
----

Kona is currently under development, but will be published on [NPM](https://www.npmjs.com/package/kona)
as features are developed.

Kona is an application framework. It's mission is to make developing really fast
Node.js applications fun and productive. It's a framework that works as fast as
you do after a cup of coffee in the morning.

Kona's focus is loosely-coupled simplicity.
There aren't a million configurations (yet), you can't use your own middleware in place of
ours, you don't need 5 json documents to tell it how to start. The basis of the
entire application is [Koa.js](https://github.com/koajs/koa) and the middleware
stack is made up of simple, efficient and modular components. Not sure how Koa works?
[Kick-Off-Koa](https://github.com/koajs/kick-off-koa) may help.

Kona uses [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).
It's an ECMA Script 6 proposal allowing functions to suspend execution and yield
to another. This allows your controller code to return query results as simply as
`var users = yield User.findAll();`. Make sure to checkout the [Koa workshop](https://github.com/koajs/workshop)
or [this helpful video](http://knowthen.com/episode-2-understanding-javascript-generators/)
if you're new to generators.


Installation:
----

You'll need Yeoman generator to generate a kona application. Use the `-g` option to install it globally so you can use the command-line interface!

`npm install -G yo`

Next, you'll want to install the [generator-kona](https://github.com/jbielick/generator-kona) generator so Yeoman can generate the kona application. Install this globally as well with the `-g` option.

`npm install -G generator-kona`

Now you've got yeoman and the kona application generator. Just generate a new
kona application to get started.

`yo kona myApplication`

The kona application generator will build an application in the directory `myApplication`.
It will then run `npm install` and `bower install` to install the server and client
dependencies you need to run your new application.

Now let's enter the the app directory with `cd myApplication`

The generator will also install the `kona` module locally in your `node_modules` folder.

To start the kona application, just use the command-line interface like so to start the server:

`./node_modules/.bin/kona server`



![example app generation][cli]

[cli]: http://i.imgur.com/DPCTWY7.gif "Usage: generate a kona app"


Environment
----

The application will start in `development` environment by default.

To set the application to start in another environment, use an environmental variable like this
`NODE_ENV=production kona s`.


Routing
----

Kona uses [barista](https://github.com/kieran/barista) for routing.

The features available there are fully-exposed in the `config/routes.js` file. The routes file
exports a function that accepts the application's router as an argument. All barista methods
can be called on the router object that is passed into the `drawRoutes` function.

When mapping a route to a controller and action, use the barista pattern `controllerName.actionName`.
The dispatcher will use this path to resolve the controller and direct the request to the appropriate action.

When mapping a route to a nested (extended) controller, you can use `/` to indicate the nesting location of the controller the request
should be dispatched to.

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
  show: function* () {
    // ...
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

Take advantage of mixins and adding functionality to your app with kona hooks.
By simply installing a `kona-*` mixin, it will automatically be hooked into your app.

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

**pending**


Model Exposure
----

**pending**

Would models in the global scope be cool? Sure. But it’s probably not a good idea.
Models can have any name—-the global namespace would get horribly messy in big apps, and
it would allow / encourage model usage in places it ought not to be.

Models are accessible as singular, PascalCase getters from the controller's `this` context.
You can perform a query or model constructor method right inside the controller action like this:

```js

// foo-controller.js

index: function* () {

  // User.find() is a function that returns a promise object
  var users = yield this.User.find();

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

`this.ModelName` actually uses an getter function to require the model. When the application is in
`development` environment, the model will be required and further accesses of the model
will use the `require` warm cache for those fetches. When a model is saved in `development`
environment, the cache of that model is deleted and the model is required from the file
system again on demand. Models are lazily-loaded in development.

**/pending**


Autoloading
----

In `development`, Kona’s controller / module loading mimics class autoloading — that is, it doesn’t eager load any modules until they are needed. Once required, they are cached and that cache is invalidated when the file is changed.

In `production`, all modules are loaded and cached during the application initialization.

You can change the autoloading behavior in dev to work like production by setting `config.eagerLoadModules = true;`.


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
    bar/
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

benchmarks
endbenchmarks
