var Parameters = require('../lib/parameters');
var buildGitPath = require('../lib/build-git-path');
var should = require('should');
var URI = require('URIjs');

describe('BuildGitPath', function() {
  it('exports function', function() {
    should(buildGitPath).be.Function();
  });
  it('throws if no clone url', function() {
    var shouldThrow = function() {
      buildGitPath(undefined);
    };
    should(shouldThrow).throw();
  });
  it('builds path', function() {
    should(buildGitPath(URI('ssh://somewhere:5678/project.git'))).be.equal('projects/somewhere/5678/project.git/git');
  });
  it('builds path without port number', function() {
    should(buildGitPath(URI('ssh://somewhere/project.git'))).be.equal('projects/somewhere/default/project.git/git');
  });
  it('ignores username', function() {
    should(buildGitPath(URI('ssh://someone@somewhere:44444/project.git'))).be.equal('projects/somewhere/44444/project.git/git');
  });
});
