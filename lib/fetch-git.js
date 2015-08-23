var assert = require('better-assert');
var path = require('path');
var async = require('async');
var shell = require('procstreams');
var mktemp = require('mktemp');
var buildGitPath = require('./build-git-path');

// Make sure we address the concurrency right

function processError(message, err, stdout, stderr) {
  var error = null;
  stderr = stderr || '';
  if (err) {
    var error = new Error(message + '\n' + stderr);
  }
  return error;
}

module.exports = function(parameters, complete) {
  assert(parameters !== undefined);
  assert(parameters.review().ref() !== undefined);
  assert(parameters.review().change() !== undefined);
  assert(parameters.review().patch() !== undefined);

  // there is a single physical bare repository where we fetch everything and
  // keep all refs for all changes and patches
  // it acts like a cache

  var cloneTo = buildGitPath(parameters);
  var branch = parameters.review().change() + '/' + parameters.review().patch();

  async.series([
    function(callback) { // initialize bare repository
      shell('git', ['init', '--bare', cloneTo]).data(function(err, stdout, stderr) {
        callback(processError('Could not initialize bare repository at ' + cloneTo, err, stdout, stderr));
      });
    },
    function(callback) { // fetch the change
      var refspec = parameters.review().ref() + ':' + branch;
      var url = parameters.repository().url().toString();
      shell('git', ['--git-dir', cloneTo, 'fetch', '-f', url, refspec]).data(function(err, stdout, stderr) {
        callback(processError('Could not fetch ' + refspec + ' from ' + url, err, stdout, stderr));
      });
    },
    function(callback) { // retrieve the list of changed files
      shell('git', ['--git-dir', cloneTo, 'diff', '--name-status', branch + '^', branch]).data(function(err, stdout, stderr) {
        if (err) {
          callback(processError('Could not diff ' + branch, err, stdout, stderr));
        } else {
          var modifications = stdout.toString().split('\n');
          modifications.forEach(function(modification) {
            if (modification !== '') {
              var parts = modification.split(/\s+/);
              if (parts[0] !== 'D') {
                parameters.review().modified().push(parts[1]);
              }
            }
          });
          callback(null);
        }
      });
    },
    function(callback) { // create temporary folder
      var parentFolder = path.dirname(cloneTo);
      mktemp.createDir(parentFolder + '/XXXXXXX', function(err, tmpPath) {
        parameters.repository().path(tmpPath);
        callback(processError('Could not make temporary folder in ' + parentFolder, err));
      });
    },
    function(callback) { // stream the archive contents
      var archive = parameters.repository().path();
      shell('git', ['archive', '--format=tar', '--remote', cloneTo, branch])
        .pipe('tar', ['x', '-C', archive])
        .data(function(err, stdout, stderr) {
          callback(processError('Could not archive ' + cloneTo + ' to ' + archive, stdout, stderr));
        });
    }
  ],
  function(err) {
    complete(err);
  });
}
