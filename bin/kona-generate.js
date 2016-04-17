#!/usr/bin/env node --harmony

var program = require('commander');
var yeoman = require('yeoman-environment');
var env = yeoman.createEnv();

program.parse(process.argv);

env.lookup(function () {
  env.run('kona:' + program.args.join(' '));
});
