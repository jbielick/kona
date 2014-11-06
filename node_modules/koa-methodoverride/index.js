
'use strict';

/**
 *  Module dependences.
 */

var methods = require('methods');

/**
 *  Method Override:
 *
 *  Provides faux HTTP method support.
 *
 *  Pass an optional `key` to use when checking for
 *  a method override, otherwise defaults to _\_method_.
 *  The original method is available via `req.originalMethod`.
 *
 *  @param {String} key
 *  @return {Function}
 *  @api public
 */

module.exports = function methodOverride(key) {
  key = key || '_method';

  return function *methodOverride(next) {
    var method;
    var request = this.request;
    request.originalMethod = request.originalMethod || request.method;

    // this.request.body
    var body = request.body;
    if (body && typeof body === 'object' && key in body) {
      method = body[key].toLowerCase();
      delete body[key];
    }

    // check X-HTTP-Method-Override
    var header = request.header;
    if (header['x-http-method-override']) {
      method = header['x-http-method-override'].toLowerCase();
    }

    // replace
    if (supports(method)) request.method = method.toUpperCase();

    yield *next;
  };
};

/**
 *  Check if node supports `method`.
 */

function supports(method) {
  return ~methods.indexOf(method);
}
