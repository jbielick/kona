var chai = require('chai');
var expect = chai.expect;
var Traversable = require(__filename.replace(/.test/g, ''));

describe('Traversable', function() {

  it('returns a getter/setter function', function() {

    var data = {
      one: {
        two: {
          three: 6
        },
        'two-point-five': {
          four: 5
        }
      }
    },
    obj = new Traversable(data);

    expect(obj).to.be.a('Function');

    expect(obj('one.two.three')).to.eql(6);

    obj('one.two.three.four.five', 7);
    expect(obj('one.two.three.four.five')).to.eql(7);

    obj('one', null);
    expect(obj('one')).to.eql(null);

  });

  it('constructs without an object argument', function() {
    expect(new Traversable()).to.be.a('Function');
  });

});