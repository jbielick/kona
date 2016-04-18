var debug = require('debug')('kona:hooks');
var path = require('path');
var fs = require('fs');
var format = require('util').format;
var co = require('co');

/**
 * @extends Kona
 *
 * provides prototype methods to yield to application hooks.
 *
 * debugs to `kona:hooks` channel
 */
module.exports = {
  /**
   * finds all listeners for the given hook event, yields to them
   * in order of the registering
   *
   * @param  {String} hookName the name of the hook to fire
   */
  hookFor: function* (hookName) {
    yield this.listeners('hook:' + hookName);
  },

  hookAround: function* (hookName, wrapped) {
    yield this.hookFor('before:' + hookName);
    yield wrapped;
    yield this.hookFor('after:' + hookName);
  }

};