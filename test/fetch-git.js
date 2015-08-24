var fetchGit = require('../lib/fetch-git');
var path = require('path');
var buildGitPath = require('../lib/build-git-path');
var should = require('should');
var Parameters = require('../lib/parameters');
var clone = require('clone');

var FakeGitDriver = function() {
  this.initBareRepo = function(cloneTo, complete) {
    var error = null;
    if (this.verifyInitBareRepo !== undefined) {
      error = this.verifyInitBareRepo(cloneTo);
    }
    process.nextTick(function() {complete(error)});
  };
  this.fetchRefspec = function(opts, complete) {
    var error = null
    if (this.verifyFetchRefspec !== undefined) {
      error = this.verifyFetchRefspec(opts);
    }
    process.nextTick(function() {complete(error)});
  };
  this.diffBranch = function(cloneTo, branch, complete) {
    var ret = {
      error: null,
      diff: ''
    };
    if (this.verifyDiffBranch !== undefined) {
      ret = this.verifyDiffBranch(cloneTo, branch);
    }
    process.nextTick(function() {complete(ret.error, ret.diff)});
  };
  this.makeTemporaryFolder = function(baseDir, complete) {
    var ret = {
      error: null,
      tmpPath: path.join(baseDir, 'Akf7f')
    };
    if (this.verifyMakeTemporaryFolder !== undefined) {
      ret = this.verifyMakeTemporaryFolder(baseDir);
    }
    process.nextTick(function() {complete(ret.error, ret.tmpPath)});
  };
  this.archiveRepo = function(from, branch, to, complete) {
    var error = null;
    if (this.verifyArchiveRepo !== undefined) {
      error = this.verifyArchiveRepo(from, branch, to);
    }
    process.nextTick(function() {complete(error)});
  };
}

describe('FetchGit', function() {
  it('exports function', function() {
    should(fetchGit).be.Function();
  });
  var parameters;
  beforeEach(function() {
    parameters = new Parameters();
    parameters.configuration().git().server('ssh://nyan@somehost');
    parameters.review().project('one');
    parameters.review().ref('refs/changes/03/3/8');
    parameters.review().change(3);
    parameters.review().patch(8);
  });
  describe('init bare repository', function() {
    it('passes error to complete', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyInitBareRepo = function(cloneTo) {
        return new Error('This is unique error');
      };
      var verifier = function(err) {
        should(err).be.instanceof(Error);
        should(err.message).be.equal('This is unique error');
        done();
      };
      fetchGit(parameters, verifier, driver);
    });
    it('uses correct path', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyInitBareRepo = function(cloneTo) {
        var expected = buildGitPath(parameters.repository().url());
        should(cloneTo).be.equal(expected);
        return null;
      };
      fetchGit(parameters, done, driver);
    });
  });
  describe('fetch change', function() {
    it('passes error to complete', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyFetchRefspec = function() {
        return new Error('Fetch refspec failed');
      };
      var verifier = function(err) {
        should(err).be.instanceof(Error);
        should(err.message).be.equal('Fetch refspec failed');
        done();
      };
      fetchGit(parameters, verifier, driver);
    });
    it('passes correct opts to driver', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyFetchRefspec = function(opts) {
        var expected = buildGitPath(parameters.repository().url());
        should(opts.cloneTo).be.equal(expected);
        var refspec = parameters.review().ref() + ':' + parameters.review().change() + '/' + parameters.review().patch();
        should(opts.refspec).be.equal(refspec);
        should(opts.url).be.equal(parameters.repository().url().toString());
        return null;
      };
      fetchGit(parameters, done, driver);
    });
  });
  describe('diff', function() {
    it('passes error to complete', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyDiffBranch = function() {
        return {
          error: new Error('Branch diff failed'),
          diff: ''
        };
      };
      var verifier = function(err) {
        should(err).be.instanceof(Error);
        should(err.message).be.equal('Branch diff failed');
        done();
      };
      fetchGit(parameters, verifier, driver);
    });
    it('passes correct arguments to driver', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyDiffBranch = function(cloneTo, branch) {
        var expected = buildGitPath(parameters.repository().url());
        should(cloneTo).be.equal(expected);
        should(branch).be.equal(parameters.review().change() + '/' + parameters.review().patch());
        return {
          error: null,
          diff: ''
        };
      };
      fetchGit(parameters, done, driver);
    });
    it('handles empty stdout', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyDiffBranch = function() {
        return {
          error: null,
          diff: ''
        };
      };
      var verifier = function(err) {
        should(parameters.review().modified()).have.length(0);
        done(err);
      };
      fetchGit(parameters, verifier, driver);
    });
    it('handles modification type', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyDiffBranch = function() {
        return {
          error: null,
          diff: 'A a/b/c/d.txt\nM     d/e/f.txt\nD\tg/h/i.txt'
        };
      };
      var verifier = function(err) {
        should(parameters.review().modified()).have.length(2);
        should(parameters.review().modified()).containEql('a/b/c/d.txt');
        should(parameters.review().modified()).containEql('d/e/f.txt');
        should(parameters.review().modified()).not.containEql('g/h/i.txt');
        done(err);
      };
      fetchGit(parameters, verifier, driver);
    });
    it('skips empty lines', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyDiffBranch = function() {
        return {
          error: null,
          diff: 'A a/b/c/d.txt\n\nM     d/e/f.txt\n'
        };
      };
      var verifier = function(err) {
        should(parameters.review().modified()).have.length(2);
        should(parameters.review().modified()).containEql('a/b/c/d.txt');
        should(parameters.review().modified()).containEql('d/e/f.txt');
        done(err);
      };
      fetchGit(parameters, verifier, driver);
    });
  });
  describe('create temporary folder', function() {
    it('passes error to complete', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyMakeTemporaryFolder = function() {
        return {
          error: new Error('No temporary folder for you'),
          tmpPath: ''
        };
      };
      var verifier = function(err) {
        should(err).be.instanceof(Error);
        should(err.message).be.equal('No temporary folder for you');
        done();
      };
      fetchGit(parameters, verifier, driver);
    });
    it('passes correct base folder path', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyMakeTemporaryFolder = function(baseDir) {
        var expected = path.dirname(buildGitPath(parameters.repository().url()));
        should(baseDir).be.equal(expected);
        return {
          error: null,
          tmpPath: baseDir + '/a1234'
        };
      };
      fetchGit(parameters, done, driver);
    });
    it('stores correct temporary folder path', function(done) {
      var driver = new FakeGitDriver();
      var verifier = function(err) {
        var expectedBaseDir = path.dirname(buildGitPath(parameters.repository().url()));
        var expected = path.join(expectedBaseDir, 'Akf7f');
        should(parameters.repository().path()).be.equal(expected);
        done(err);
      };
      fetchGit(parameters, verifier, driver);
    });
  });
  describe('archive', function() {
    it('passes error to complete', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyArchiveRepo = function() {
        return new Error('Could not unpack archive');
      };
      var verifier = function(err) {
        should(err).be.instanceof(Error);
        should(err.message).be.equal('Could not unpack archive');
        done();
      };
      fetchGit(parameters, verifier, driver);
    });
    it('passes correct parameters', function(done) {
      var driver = new FakeGitDriver();
      driver.verifyArchiveRepo = function(cloneTo, branch, archive) {
        var expectedCloneTo = buildGitPath(parameters.repository().url());
        should(cloneTo).be.equal(expectedCloneTo);
        should(branch).be.equal(parameters.review().change() + '/' + parameters.review().patch());
        var expectedBaseDir = path.dirname(buildGitPath(parameters.repository().url()));
        var expectedArchive = path.join(expectedBaseDir, 'Akf7f');
        should(archive).be.equal(expectedArchive);
        return null;
      };
      fetchGit(parameters, done, driver);
    });
    it('stores correct path', function(done) {
      var driver = new FakeGitDriver();
      var verifier = function(err) {
        var expectedBaseDir = path.dirname(buildGitPath(parameters.repository().url()));
        var expectedArchive = path.join(expectedBaseDir, 'Akf7f');
        should(parameters.repository().path()).be.equal(expectedArchive);
        done(err);
      };
      fetchGit(parameters, verifier, driver);
    });
  });
})
