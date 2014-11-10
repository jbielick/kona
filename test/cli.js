var request = require('supertest');
var statuses = require('statuses');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var http = require('http');
var Kona = require('../lib/kona');
var exec = require('child_process').exec;
var path = require('path');
var binPath = path.join(process.cwd(), '..', 'bin', 'kona.js');
chai.use(sinonChai);

describe('CLI', function() {
  describe('starts the kona app and listens', function() {
    it('with no options', function (done) {
      exec(binPath, function(err, stdout, stderr) {

      });
      console.log(exec('ps -ef | grep node'));
    });
  });
});