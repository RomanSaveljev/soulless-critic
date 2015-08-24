var Parameters = require('../lib/parameters');
var should = require('should');
var URI = require('URIjs');

describe('Parameters', function() {
  describe('review', function() {
    var parameters = new Parameters();
    it('is function', function() {
      should(parameters.review).be.Function();
    });
    it('returns object', function() {
      should(parameters.review()).be.Object();
    });
  });
  describe('review().change', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().change).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.review().change()).be.undefined();
    });
    it('stores passed value', function() {
      parameters.review().change(12);
      should(parameters.review().change()).be.equal(12);
    });
  });
  describe('review().patch', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().patch).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.review().patch()).be.undefined();
    });
    it('stores passed value', function() {
      parameters.review().patch(3);
      should(parameters.review().patch()).be.equal(3);
    });
  });
  describe('review().ref', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().ref).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.review().ref()).be.undefined();
    });
    it('returns undefined if patch not set', function() {
      parameters.review().change(4);
      should(parameters.review().ref()).be.undefined();
    });
    it('returns undefined if change not set', function() {
      parameters.review().patch(4);
      should(parameters.review().ref()).be.undefined();
    });
    it('returns undefined if patch not set', function() {
      parameters.review().change(4);
      should(parameters.review().ref()).be.undefined();
    });
    it('ref assignment overrides default', function() {
      var ref = 'refs/changes/05/1105/1';
      parameters.review().change(4);
      parameters.review().patch(2);
      parameters.review().ref(ref);
      should(parameters.review().ref()).be.equal(ref);
    });
    it('default: patch number is respected', function() {
      parameters.review().change(2);
      parameters.review().patch(1);
      should(parameters.review().ref()).be.equal('refs/changes/02/2/1');
      parameters.review().patch(10);
      should(parameters.review().ref()).be.equal('refs/changes/02/2/10');
      parameters.review().patch(100);
      should(parameters.review().ref()).be.equal('refs/changes/02/2/100');
    });
    it('default: change number is respected', function() {
      parameters.review().patch(1);
      parameters.review().change(1);
      should(parameters.review().ref()).be.equal('refs/changes/01/1/1');
      parameters.review().change(12);
      should(parameters.review().ref()).be.equal('refs/changes/12/12/1');
      parameters.review().change(215);
      should(parameters.review().ref()).be.equal('refs/changes/15/215/1');
    });
  });
  describe('review().project', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().project).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.review().project()).be.undefined();
    });
    it('stores assigned value', function() {
      parameters.review().project('my-project');
      should(parameters.review().project()).be.equal('my-project');
    });
  });
  describe('review().modified', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().modified).be.Function();
    });
    it('returns array', function() {
      should(parameters.review().modified()).be.Array();
    });
  });
  describe('review().message', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().message).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.review().message()).be.undefined();
    });
    it('stores assigned value', function() {
      parameters.review().message('Message');
      should(parameters.review().message()).be.equal('Message');
    });
  });
  describe('review().comments', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.review().comments).be.Function();
    });
    it('requires a parameter', function() {
      should(parameters.review().comments).throw();
    });
    it('allocates array per entry', function() {
      var one = parameters.review().comments('one');
      var two = parameters.review().comments('two');
      should(one).be.Array();
      should(two).be.Array();
      should(one).have.length(0);
      two.push(0);
      should(parameters.review().comments('two')).have.length(1);
      should(parameters.review().comments('one')).have.length(0);
      one.push(false);
      should(parameters.review().comments('one')).have.length(1);
    });
  });
  describe('configuration', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration).be.Function();
    });
    it('returns object', function() {
      should(parameters.configuration()).be.Object();
    });
  });
  describe('configuration().git', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().git).be.Function();
    });
    it('returns object', function() {
      should(parameters.configuration().git()).be.Object();
    });
  });
  describe('configuration().git().server', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().git().server).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.configuration().git().server()).be.undefined();
    });
    it('accepts strings', function() {
      parameters.configuration().git().server('ssh://localhost:12783');
      should(parameters.configuration().git().server().equals('ssh://localhost:12783')).be.true();
    });
    it('accepts URI', function() {
      parameters.configuration().git().server(URI('ssh://localhost:12783'));
      should(parameters.configuration().git().server().equals('ssh://localhost:12783')).be.true();
    });
  });
  describe('configuration().git().project', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().git().project).be.Function();
    });
    it('returns object', function() {
      should(parameters.configuration().git().project()).be.Object();
    });
    it('accepts project name and returns object', function() {
      should(parameters.configuration().git().project('first')).be.Object();
    });
  });
  describe('configuration().git().project().url', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().git().project().url).be.Function();
    });
    it('returns undefined, if no project', function() {
      should(parameters.configuration().git().project().url()).be.undefined();
    });
    it('returns undefined, if no server', function() {
      should(parameters.configuration().git().project('first').url()).be.undefined();
    });
    it('builds default url for a project', function() {
      parameters.configuration().git().server('ssh://localhost');
      should(parameters.configuration().git().project('first').url().equals('ssh://localhost/first')).be.true();
    });
    it('stores url for project', function() {
      parameters.configuration().git().project('first').url('ssh://localhost/some-path');
      should(parameters.configuration().git().project('first').url().equals('ssh://localhost/some-path')).be.true();
    });
  });
  describe('configuration().checkstyle', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().checkstyle).be.Function();
    });
    it('returns object', function() {
      should(parameters.configuration().checkstyle()).be.Object();
    });
  });
  describe('configuration().checkstyle().enabled', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().checkstyle().enabled).be.Function();
    });
    it('returns false by default', function() {
      should(parameters.configuration().checkstyle().enabled()).be.equal(false);
    });
    it('stores assigned value', function() {
      parameters.configuration().checkstyle().enabled(true);
      should(parameters.configuration().checkstyle().enabled()).be.equal(true);
    });
  });
  describe('configuration().checkstyle().jar', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().checkstyle().jar).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.configuration().checkstyle().jar()).be.undefined();
    });
    it('stores assigned value', function() {
      parameters.configuration().checkstyle().jar('checkstyle.jar');
      should(parameters.configuration().checkstyle().jar()).be.equal('checkstyle.jar');
    });
  });
  describe('configuration().checkstyle().defaultXml', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().checkstyle().defaultXml).be.Function();
    });
    it('returns something by default', function() {
      should(parameters.configuration().checkstyle().defaultXml()).not.be.empty();
    });
    it('stores assigned value', function() {
      parameters.configuration().checkstyle().defaultXml('def.xml');
      should(parameters.configuration().checkstyle().defaultXml()).be.equal('def.xml');
    });
  });
  describe('configuration().checkstyle().xml', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.configuration().checkstyle().xml).be.Function();
    });
    it('returns checkstyle.xml by default', function() {
      should(parameters.configuration().checkstyle().xml()).be.equal('checkstyle.xml');
    });
    it('stores assigned value', function() {
      parameters.configuration().checkstyle().xml('xml.xml');
      should(parameters.configuration().checkstyle().xml()).be.equal('xml.xml');
    });
  });
  describe('repository', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.repository).be.Function();
    });
    it('returns object', function() {
      should(parameters.repository()).be.Object();
    });
  });
  describe('repository().url', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.repository().url).be.Function();
    });
    it('returns undefined, if no project', function() {
      should(parameters.repository().url()).be.undefined();
    });
    it('returns default url for current project', function() {
      parameters.review().project('my-proj');
      parameters.configuration().git().server('ssh://localhost:3456');
      should(parameters.repository().url().equals('ssh://localhost:3456/my-proj')).be.true();
    });
    it('return configured url for current project', function() {
      parameters.review().project('my-proj');
      parameters.configuration().git().project('my-proj').url('ssh://google.com:55551/my-proj');
      should(parameters.repository().url().equals('ssh://google.com:55551/my-proj')).be.true();
    });
  });
  describe('repository().path', function() {
    var parameters;
    beforeEach(function() {
      parameters = new Parameters();
    });
    it('is function', function() {
      should(parameters.repository().path).be.Function();
    });
    it('returns undefined by default', function() {
      should(parameters.repository().path()).be.undefined();
    });
    it('stores assigned value', function() {
      parameters.repository().path('a/b/c/d');
      should(parameters.repository().path()).be.equal('a/b/c/d');
    });
  });
});
