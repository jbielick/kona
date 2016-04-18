var chalk = require('chalk');
var _ = require('lodash');
var util = require('util');

var bean = function(messages) {
  var lines;
  messages || (messages = []);
  if (!_.isArray(messages) && _.isString(messages)) {
    messages = [].slice.call(arguments);
  }
  messages[0] = 'Kona: ' + (messages[0] || ''),
  messages[1] = messages[1] || '';
  lines = [
    "",
    "       ,-```-.",
    "      /   /   \\",
    "     `   |     `",
    "     '    `.    `   %s",
    "     `     .    `   %s",
    "      \\   |    /",
    "       `-....-'\n"
  ].join("\n");
  messages.unshift(lines);
  return util.format.apply(util, messages);
}

module.exports = bean;