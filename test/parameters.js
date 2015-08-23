var Parameters = require('../lib/parameters');
var should = require('should');
var URI = require('URIjs');

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
  describe('gitServer', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.gitServer).be.Function();
    });
    it('extracts git.server', function() {
      var server = 'ssh://john@localhost:29418';
      var parameters = new Parameters();
      parameters.git = {};
      parameters.git.server = server;
      should(parameters.gitServer().equals(server)).be.true();
    });
    it('plants git.server', function() {
      var server = 'ssh://hacker@google.com:1337';
      var parameters = new Parameters();
      parameters.gitServer(server);
      should(parameters.git.server).be.equal(server);
    });
    it('returns URI object', function() {
      var parameters = new Parameters();
      parameters.gitServer('http://www.abc.com');
      should(parameters.gitServer()).be.instanceof(URI);
    });
    it('accepts URI object', function() {
      var url = 'ssh://blackho.le';
      var parameters = new Parameters();
      parameters.gitServer(URI(url));
      should(parameters.gitServer().equals(url)).be.true();
    });
  });
  describe('projectCloneUrl', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.projectCloneUrl).be.Function();
    });
    it('extracts git.clone[project]', function() {
      var clone = 'ssh://john@localhost:29418/super-stuff.git';
      var project = 'super-stuff';
      var parameters = new Parameters();
      parameters.git = {};
      parameters.git.project = {};
      parameters.git.project.clone = {};
      parameters.git.project.clone[project] = clone;
      should(parameters.projectCloneUrl(project).equals(clone)).be.true();
    });
    it('plants git.clone[project]', function() {
      var clone = 'ssh://smeagol@misty-mountains:29418/my-preciouss.git';
      var project = 'my-precioussss';
      var parameters = new Parameters();
      parameters.projectCloneUrl(project, clone);
      should(parameters.git.project.clone[project]).be.equal(clone);
    });
    it('returns URL for project() by default', function() {
      var clone = 'http://www.google.com/hidden.git';
      var project = 'hidden';
      var parameters = new Parameters();
      parameters.project(project);
      parameters.projectCloneUrl(project, clone);
      should(parameters.projectCloneUrl().equals(clone)).be.true();
    });
    it('returns undefined, when project is not known', function() {
      var parameters = new Parameters();
      should(parameters.projectCloneUrl()).be.undefined();
    });
    it('builds default project clone url', function() {
      var parameters = new Parameters();
      parameters.gitServer('ssh://www.microsoft.com:6666');
      parameters.project('domination-plans');
      var expected = 'ssh://www.microsoft.com:6666/domination-plans';
      should(parameters.projectCloneUrl().equals(expected)).be.true();
    });
    it('returns URI object', function() {
      var parameters = new Parameters();
      parameters.gitServer('ssh://www.microsoft.com:6666');
      parameters.project('domination-plans');
      should(parameters.projectCloneUrl()).be.instanceof(URI);
    });
    it('assignment overrides defaults', function() {
      var project = 'cats';
      var destination = 'ssh://cats.co/cats';
      var parameters = new Parameters();
      parameters.gitServer('ssh://www.microsoft.com:6666');
      parameters.project(project);
      parameters.projectCloneUrl(project, destination);
      should(parameters.projectCloneUrl().equals(destination)).be.true();
    });
    it('supports multiple projects', function() {
      var projectOne = 'one';
      var projectTwo = 'two';
      var destinationOne = 'ssh://a.a/one';
      var destinationTwo = 'ssh://b.b/two';
      var parameters = new Parameters();
      parameters.projectCloneUrl(projectOne, destinationOne);
      parameters.projectCloneUrl(projectTwo, destinationTwo);
      should(parameters.projectCloneUrl(projectOne).equals(destinationOne)).be.true();
      should(parameters.projectCloneUrl(projectTwo).equals(destinationTwo)).be.true();
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
  describe('cloneTo', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.cloneTo).be.Function();
    });
    it('derives from projectCloneUrl()', function() {
      var project = 'project';
      var parameters = new Parameters();
      parameters.projectCloneUrl(project, 'ssh://somewhere:5678/project.git');
      parameters.project(project);
      should(parameters.cloneTo()).be.equal('projects/somewhere/5678/project.git/git');
    });
    it('derives from projectCloneUrl() without port number', function() {
      var project = 'project';
      var parameters = new Parameters();
      parameters.projectCloneUrl(project, 'ssh://somewhere/project.git');
      parameters.project(project);
      should(parameters.cloneTo()).be.equal('projects/somewhere/default/project.git/git');
    });
    it('derives from projectCloneUrl() with username', function() {
      var project = 'project';
      var parameters = new Parameters();
      parameters.projectCloneUrl(project, 'ssh://someone@somewhere:44444/project.git');
      parameters.project(project);
      should(parameters.cloneTo()).be.equal('projects/somewhere/44444/project.git/git');
    });
  });
  describe('branch', function() {
    it('is function', function() {
      var parameters = new Parameters();
      should(parameters.branch).be.Function();
    });
    it('builds from change() and patch()', function() {
      var parameters = new Parameters();
      parameters.change(5);
      parameters.patch(3);
      should(parameters.branch()).be.equal('5/3');
    });
    it('returns undefined if no change() or patch()', function() {
      var parameters = new Parameters();
      should(parameters.branch()).be.undefined();
      parameters.change(6);
      should(parameters.branch()).be.undefined();
      parameters = new Parameters();
      parameters.patch(8);
      should(parameters.branch()).be.undefined();
    });
  })
});
