var assert = require('better-assert');
var path = require('path');
var async = require('async');
var shell = require('procstreams');
var mktemp = require('mktemp');
var buildGitPath = require('./build-git-path');
var gitDriver = require('./git-driver');

// Make sure we address the concurrency right

function processError(message, err, stdout, stderr) {
  var error = null;
  stderr = stderr || '';
  if (err) {
    var error = new Error(message + '\n' + stderr);
  }
  return error;
}

module.exports = function(parameters, complete, driver) {
  assert(parameters !== undefined);
  assert(parameters.review().ref() !== undefined);
  assert(parameters.review().change() !== undefined);
  assert(parameters.review().patch() !== undefined);

  driver = driver || gitDriver;

  // there is a single physical bare repository where we fetch everything and
  // keep all refs for all changes and patches
  // it acts like a cache

  var cloneTo = buildGitPath(parameters.repository().url());
  var branch = parameters.review().change() + '/' + parameters.review().patch();

  async.waterfall([
    function(callback) { // initialize bare repository
      driver.initBareRepo(cloneTo, callback);
    },
    function(callback) { // fetch the change
      var opts = {};
      opts.cloneTo = cloneTo;
      opts.refspec = parameters.review().ref() + ':' + branch;
      opts.url = parameters.repository().url().toString();
      driver.fetchRefspec(opts, callback);
    },
    function(callback) { // retrieve the list of changed files
      driver.diffBranch(cloneTo, branch, callback);
    },
    function(stdout, callback) { // parse modifications
      var modifications = stdout.toString().split('\n');
      modifications.forEach(function(modification) {
        if (modification !== '') {
          var parts = modification.split(/\s+/);
          if (parts[0] !== 'D') {
            parameters.review().modified().push(parts[1]);
          }
        }
      });
      process.nextTick(function() {callback(null)});
    },
    function(callback) { // create temporary folder
      var parentFolder = path.dirname(cloneTo);
      driver.makeTemporaryFolder(parentFolder, callback);
      mktemp.createDir(parentFolder + '/XXXXXXX', function(err, tmpPath) {
        parameters.repository().path(tmpPath);
        callback(processError('Could not make temporary folder in ' + parentFolder, err));
      });
    },
    function(tmpPath, callback) { // save temporary folder
      parameters.repository().path(tmpPath);
      process.nextTick(function() {callback(null)});
    },
    function(callback) { // stream the archive contents
      var archive = parameters.repository().path();
      driver.archiveRepo(cloneTo, branch, archive, callback);
    }
  ],
  function(err) {
    complete(err);
  });
}
