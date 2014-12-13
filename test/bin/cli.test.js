var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var Kona = require(path.join(__dirname.replace('test', ''), 'cli'));
var binPath = __filename.replace(/.test/g, '');
var exec = require('child_process').exec;

describe('CLI', function() {

  // it('logs help', function(done) {

  //   exec(binPath, function(err, stdout, stderr) {
  //     if (err) {
  //       throw new Error(err);
  //     }
  //     expect(stdout).to.include('Usage');
  //     expect(stdout).to.include('Commands');
  //     expect(stdout).to.include('Options');

  //     done();
  //   });

  // });

  // it('fails because the cwd isn\'t a Kona app', function(done) {

  //   exec(binPath + ' server', function(err, stdout, stderr) {
  //     if (err) {
  //       throw new Error(err);
  //     }
  //     expect(stderr).to.include('in a kona app directory');

  //     done();
  //   });

  // });

});