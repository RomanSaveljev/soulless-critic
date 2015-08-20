var URI = require('URIjs');
var ReadWriteLock = require('rwlock');
var assert = require('better-assert');
var path = require('path');
var async = require('async');
var shell = require('procstreams');
var mktemp = require('mktemp');

// Make sure we address the concurrency right

function processError(message, err, stdout, stderr) {
  var error = null;
  stderr = stderr || '';
  if (err) {
    var error = new Error(message + '\n' + stderr);
  }
  return error;
}

exports.prepare = function(parameters, complete) {
  assert(parameters.protocol !== undefined);
  assert(parameters.host !== undefined);
  assert(parameters.project !== undefined);
  assert(parameters.change !== undefined);
  assert(parameters.patch !== undefined);
  assert(parameters.ref !== undefined);

  // there is a single physical bare repository where we fetch everything and
  // keep all refs for all changes and patches
  // it acts like a cache
  parameters.base = path.resolve(path.join('projects', parameters.host, parameters.project, 'git'));
  parameters.branch = parameters.change + '/' + parameters.patch;

  async.series([
    function(callback) { // initialize bare repository
      shell('git', ['init', '--bare', parameters.base]).data(function(err, stdout, stderr) {
        callback(processError('Could not initialize bare repository at ' + parameters.base, err, stdout, stderr));
      });
    },
    function(callback) { // fetch the change
      var uri = URI()
        .scheme(parameters.protocol)
        .host(parameters.host)
        .path('/' + parameters.project);
      var refspec = parameters.ref + ':' + parameters.branch;
      shell('git', ['--git-dir', parameters.base, 'fetch', '-f', uri.toString(), refspec]).data(function(err, stdout, stderr) {
        callback(processError('Could not fetch ' + refspec + ' from ' + uri.toString(), err, stdout, stderr));
      });
    },
    function(callback) { // retrieve the list of changed files
      shell('git', ['--git-dir', parameters.base, 'diff', '--name-status', parameters.branch + '^', parameters.branch]).data(function(err, stdout) {
        if (err) {
          callback(processError('Could not diff ' + parameters.branch, err, stdout, stderr));
        } else {
          var entries = stdout.toString().split('\n');
          parameters.entries = {};
          entries.forEach(function(entry) {
            if (entry !== '') {
              var parts = entry.split(/\s+/);
              parameters.entries[parts[1]] = {
                'modification': parts[0]
              };
            }
          });
          callback(null);
        }
      });
    }
  ],
  function(err) {
    complete(err, parameters);
  });
}

exports.archive = function(parameters, complete) {
  assert(parameters.base !== undefined);
  assert(parameters.branch !== undefined);
  var parentFolder = path.dirname(parameters.base);
  async.series([
    function(callback) { // create temporary folder
      mktemp.createDir(parentFolder + '/XXXXXXX', function(err, path) {
        parameters.archive = path;
        callback(processError('Could not make temporary folder in ' + parentFolder, err));
      });
    },
    function(callback) { // stream the archive contents
      shell('git', ['archive', '--format=tar', '--remote', parameters.base, parameters.branch])
        .pipe('tar', ['x', '-C', parameters.archive])
        .data(function(err, stdout, stderr) {
          callback(processError('Could not archive ' + parameters.base + ' to ' + parameters.archive, stdout, stderr));
        });
    }
  ],
  function(err) {
    complete(err, parameters);
  });
}
