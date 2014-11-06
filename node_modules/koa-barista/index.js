var barista = new require('barista').Router
var util = require('util')
var fs = require('fs')
var debug = require('debug')('koa-barista')


// Export

module.exports = Router

/**
 * Router that extends barista router
 *
 * @param {Object} Options List of options
 */
function Router(directory) {
  this.directory = directory || ''
  barista.call(this)
}

// Inherit from barista

util.inherits(Router, barista)

/**
 * Callback method for koa middleware
 *
 * @return {Function} Returns generator function
 */
Router.prototype.callback = function() {

  var self = this

  return function *router(next) {

    // Try to get the first match

    var match = self.first(this.request.url, this.request.method)

    // Add router to context

    self.match = match;
    this.router = self;

    // No match found

    if (match === false) {
      debug('no match found for url: "%s"', this.request.url)
      yield next
      return
    }

    // Try to get the controller file

    var dir = self.directory

    var filename = dir + match.controller + '.js'

    if (!fs.existsSync(filename)) {
      debug('controller file does not exist: "%s"', match.controller)
      yield next
      return
    }

    // Load controller and check the action method

    var controller = require(filename)

    if (typeof controller[match.action] === 'function') {
      debug('route url to controller "%s" and action "%s', controller, match.action)
      yield controller[match.action]
      return
    }

    // Action not found

    debug('action "%s" in controller "%s" not found', match.action, controller)
    yield next

  }

}
