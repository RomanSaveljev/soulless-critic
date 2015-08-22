var URI = require('URIjs');
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
  assert(parameters !== undefined);

  // there is a single physical bare repository where we fetch everything and
  // keep all refs for all changes and patches
  // it acts like a cache
  var baseUrl = URI(parameters.git.baseUrl);
  parameters.base = path.resolve(path.join('projects', baseUrl.host(), parameters.eventData.change.project, 'git'));
  parameters.branch = parameters.change() + '/' + parameters.patch();

  async.series([
    function(callback) { // initialize bare repository
      shell('git', ['init', '--bare', parameters.cloneTo()]).data(function(err, stdout, stderr) {
        callback(processError('Could not initialize bare repository at ' + parameters.cloneTo(), err, stdout, stderr));
      });
    },
    function(callback) { // fetch the change
      var refspec = parameters.ref() + ':' + parameters.branch();
      shell('git', ['--git-dir', parameters.cloneTo(), 'fetch', '-f', parameters.projectCloneUrl(), refspec]).data(function(err, stdout, stderr) {
        callback(processError('Could not fetch ' + refspec + ' from ' + parameters.projectCloneUrl(), err, stdout, stderr));
      });
    },
    function(callback) { // retrieve the list of changed files
      shell('git', ['--git-dir', parameters.cloneTo(), 'diff', '--name-status', parameters.branch() + '^', parameters.branch()]).data(function(err, stdout, stderr) {
        if (err) {
          callback(processError('Could not diff ' + parameters.branch(), err, stdout, stderr));
        } else {
          var entries = stdout.toString().split('\n');
          entries.forEach(function(entry) {
            if (entry !== '') {
              var parts = entry.split(/\s+/);
              parameters.registerEntry(parts[0], parts[1]);
            }
          });
          callback(null);
        }
      });
    },
    function(callback) { // create temporary folder
      mktemp.createDir(path.dirname(parameters.cloneTo()) + '/XXXXXXX', function(err, path) {
        parameters.archiveTo(path);
        callback(processError('Could not make temporary folder in ' + parentFolder, err));
      });
    },
    function(callback) { // stream the archive contents
      shell('git', ['archive', '--format=tar', '--remote', parameters.cloneTo(), parameters.branch()])
      .pipe('tar', ['x', '-C', parameters.archiveTo()])
      .data(function(err, stdout, stderr) {
        callback(processError('Could not archive ' + parameters.cloneTo() + ' to ' + parameters.archiveTo(), stdout, stderr));
      });
    }
  ],
  function(err) {
    complete(err);
  });
}
