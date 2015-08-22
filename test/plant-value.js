var plantValue = require('../lib/plant-value');
var should = require('should');

describe('PlantValue', function() {
  describe('integration', function() {
    it('exports function', function() {
      var imported = require('../lib/plant-value.js');
      should(imported).be.Function();
    });
  });
  describe('implementation', function() {
    var obj;
    beforeEach(function() {
      obj = {};
    });
    it('creates simple object tree inside', function() {
      plantValue.apply(obj, ['one', 'two', 'three']);
      should(obj).have.property('one');
      should(obj.one).be.Object();
      should(obj.one).have.property('two');
      should(obj.one.two).be.String();
      should(obj.one.two).be.equal('three');
    });
    it('supports adding property directly', function() {
      plantValue.apply(obj, ['property', 'value']);
      should(obj).have.property('property');
      should(obj.property).be.String();
      should(obj.property).be.equal('value');
    });
    it('returns passed object', function() {
      var ret = plantValue.apply(obj, ['one', 'two']);
      ret.three = 'four';
      should(obj).have.property('three');
      should(obj.three).be.String();
      should(obj.three).be.equal('four');
    });
  })
});
