// var format = require('util').format;
// var path = require('path');
// // var read = require('fs-readdir-recursive');
// var requireAll = require('require-all');
// var debug = require('debug')('kona:module-loader');

// /**
//  * given a directory, will recursively require all modules and key their
//  * export by their name less a "strip" string and return that
//  * object (including nested)
//  *
//  * @param  {String} dir   directory to recursively load from
//  * @param  {string} strip optional string to strip from the module filename
//  *                        to generate the key
//  * @return {Object}       an object whose keys are relative path + module
//  *                           name less the stripped string and values that
//  *                           are the export of that module.
//  */
// module.exports.loadModules = function loadModules(type, name, invalidate) {
//   var _this = this,
//       paths = {
//         concepts: this.root.join('app', 'concepts')
//       },
//       normalizer = type ? new RegExp('-' + type) : '',
//       module;

//   if (type && !paths[type]) {
//     throw new Error('Not a valid module type to load');
//   } else if (type) {

//   }

//   this.modules || (this.modules = {});

//   if (type) {
//     loadPath = paths[type];
//   } else {

//   }

//   // read(paths.concepts, function(filename) {
//   //   return filename[0] !== '.';
//   // }).forEach(function(moduleName) {
//   //   var key = moduleName.replace(normalizer, ''),
//   //       constructor;
//   //   try {
//   //     constructor = require(path.join(paths.concepts, moduleName));
//   //     this.modules[key] = constructor;
//   //     debug(format('Module Loaded: %s', moduleName));
//   //   } catch(e) {
//   //     _this.log.error(format("Failed to load %s: %s \n %s \n", moduleName, e.message, e.stack));
//   //     _this.onerror(e);
//   //   }
//   // }.bind(this));
//   return this.modules;
// };