var shell = require('procstreams');
var assert = require('better-assert');
var clone = require('clone');
var sshSpawner = require('ssh-spawner');
var stream = require('stream');

module.exports = function(parameters, complete) {
  assert(parameters !== undefined);
  assert(parameters.entries !== undefined);
  assert(parameters.user !== undefined);
  assert(parameters.host !== undefined);
  assert(parameters.port !== undefined);

  var reviewInput = {};
  reviewInput.message = 'Criticized relentlessly';
  reviewInput.comments = {};

  for (var entry in parameters.entries) {
    var comments = parameters.entries[entry].comments;
    if (comments !== undefined && comments.length > 0) {
      reviewInput.comments[entry] = clone(comments);
    }
  }

  var ssh = sshSpawner.createSpawner({
    user: parameters.user,
    server: parameters.host,
    port: parameters.port
  });
  var spawn = ssh(
    'gerrit',
    ['review', parameters.eventData.change.number + ',' + parameters.eventData.patchSet.number, '-j'],
    {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  spawn.stdin.end(JSON.stringify(reviewInput), 'utf-8');
  var stdout = '';
  spawn.stdout.on('data', function(chunk) {
    stdout += chunk.toString();
  });
  var stderr = '';
  spawn.stderr.on('data', function(chunk) {
    stderr += chunk.toString();
  });
  spawn.on('exit', function(code) {
    if (code != 0) {
      complete(new Error('Failed to submit comments: ' + code + '\n' + stdout + '\n' + stderr));
    } else {
      complete(null);
    }
  });
};
