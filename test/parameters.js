var Parameters = require('../lib/parameters');
var should = require('should');

describe('Parameters', function() {
  describe('change', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.change).be.Function();
    });
    it('extracts eventData.change.number', function() {
      var parameters = new Parameters();
      parameters.eventData = {};
      parameters.eventData.change = {};
      parameters.eventData.change.number = 8;
      should(parameters.change()).be.equal(8);
    });
    it('plants eventData.change.number', function() {
      var parameters = new Parameters();
      parameters.change(7);
      should(parameters.eventData).be.Object();
      should(parameters.eventData.change).be.Object();
      should(parameters.eventData.change.number).be.equal(7);
    });
  });
  describe('patch', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.patch).be.Function();
    });
    it('extracts eventData.patchSet.number', function() {
      var parameters = new Parameters();
      parameters.eventData = {};
      parameters.eventData.patchSet = {};
      parameters.eventData.patchSet.number = 19;
      should(parameters.patch()).be.equal(19);
    });
    it('plants eventData.patchSet.number', function() {
      var parameters = new Parameters();
      parameters.patch(72);
      should(parameters.eventData).be.Object();
      should(parameters.eventData.patchSet).be.Object();
      should(parameters.eventData.patchSet.number).be.equal(72);
    });
  });

});
