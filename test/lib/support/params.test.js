var chai = require('chai');
var expect = chai.expect;
var Params = require(__filename.replace(/.test/g, ''));

describe('Params', function() {

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
    params = new Params(data);

    expect(params).to.be.a('Function');

    expect(params('one.two.three')).to.eql(6);

    params('one.two.three.four.five', 7);
    expect(params('one.two.three.four.five')).to.eql(7);

    params('one', null);
    expect(params('one')).to.eql(null);

  });

});