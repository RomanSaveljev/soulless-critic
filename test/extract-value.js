var extractValue = require('../lib/extract-value');
var should = require('should');

describe('ExtractValue', function() {
  describe('integration', function() {
    it('exports function', function() {
      var imported = require('../lib/extract-value.js');
      should(imported).be.Function();
    });
  });
  describe('implementation', function() {
    it('returns extracted value', function() {
      var obj = {
        'one': {
          'two': 'three'
        }
      };
      var ret = extractValue.apply(obj, ['one', 'two']);
      should(ret).be.String();
      should(ret).be.equal('three');
    });
    it('handles flat object', function() {
      var obj = {
        'one': 'two'
      };
      var ret = extractValue.apply(obj, ['one']);
      should(ret).be.String();
      should(ret).be.equal('two');
    });
    it('defaults to undefined for non-existent property', function() {
      var obj = {
        'one' : {}
      };
      should(extractValue.apply(obj, ['one', 'two', 'three'])).be.undefined();
    });
    it('defaults to undefined with no arguments', function() {
      var obj = {};
      should(extractValue.apply(obj, [])).be.undefined();
    });
  })
});
