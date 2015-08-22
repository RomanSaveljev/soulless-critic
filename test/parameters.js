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
  describe('project', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.project).be.Function();
    });
    it('extracts eventData.change.project', function() {
      var project = 'my-project';
      var parameters = new Parameters();
      parameters.eventData = {};
      parameters.eventData.change = {};
      parameters.eventData.change.project = project;
      should(parameters.project()).be.equal(project);
    });
    it('plants eventData.change.project', function() {
      var project = 'cool-stuff';
      var parameters = new Parameters();
      parameters.project(project);
      should(parameters.eventData).be.Object();
      should(parameters.eventData.change).be.Object();
      should(parameters.eventData.change.project).be.equal(project);
    });
  });
  describe('ref', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.ref).be.Function();
    });
    it('extracts eventData.patchSet.ref', function() {
      var ref = 'refs/changes/19/19/2';
      var parameters = new Parameters();
      parameters.eventData = {};
      parameters.eventData.patchSet = {};
      parameters.eventData.patchSet.ref = ref;
      should(parameters.ref()).be.equal(ref);
    });
    it('plants eventData.patchSet.ref', function() {
      var ref = 'refs/changes/03/103/2';
      var parameters = new Parameters();
      parameters.ref(ref);
      should(parameters.eventData).be.Object();
      should(parameters.eventData.patchSet).be.Object();
      should(parameters.eventData.patchSet.ref).be.equal(ref);
    });
    it('ref assignment overrides default', function() {
      var ref = 'refs/changes/05/1105/1';
      var parameters = new Parameters();
      parameters.change(4);
      parameters.patch(2);
      parameters.ref(ref);
      should(parameters.ref()).be.equal(ref);
    });
    describe('builds default refspec', function() {
      it('patch number is respected', function() {
        var parameters = new Parameters();
        parameters.change(2);
        parameters.patch(1);
        should(parameters.ref()).be.equal('refs/changes/02/2/1');
        parameters.patch(10);
        should(parameters.ref()).be.equal('refs/changes/02/2/10');
        parameters.patch(100);
        should(parameters.ref()).be.equal('refs/changes/02/2/100');
      });
      it('change number is respected', function() {
        var parameters = new Parameters();
        parameters.patch(1);
        parameters.change(1);
        should(parameters.ref()).be.equal('refs/changes/01/1/1');
        parameters.change(12);
        should(parameters.ref()).be.equal('refs/changes/12/12/1');
        parameters.change(215);
        should(parameters.ref()).be.equal('refs/changes/15/215/1');
      });
      it('returns undefined if no patch', function() {
        var parameters = new Parameters();
        parameters.change(2);
        should(parameters.ref()).be.undefined();
      });
      it('returns undefined if no change', function() {
        var parameters = new Parameters();
        parameters.patch(3);
        should(parameters.ref()).be.undefined();
      });
    });
  });
});
