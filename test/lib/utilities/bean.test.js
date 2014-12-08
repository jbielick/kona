var bean = require(__filename.replace(/.test/g, ''));
var chai = require('chai');
var expect = chai.expect;

describe('the bean', function() {
  it('injects two strings next to the bean', function() {
    var message = bean(['1337', 'h4x']);
    expect(message).to.include('1337');
    expect(message).to.include('h4x');

    message = bean('1337', 'h4x');
    expect(message).to.include('1337');
    expect(message).to.include('h4x');

    expect(function() {
      message = bean();
    }).to.not.throw(Error);
  });
});