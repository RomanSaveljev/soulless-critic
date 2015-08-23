var assert = require('better-assert');
var gitRepository = require('./git-repository');
var async = require('async');
var checks = require('./checks');
var submitComments = require('./submit-comments');

module.exports = function(parameters, complete) {
  assert(parameters !== undefined);

  async.series([
    function(callback) { // prepare repository snapshot
      gitRepository.prepare(parameters, callback);
    },
    function(callback) { // take a snapshot
      gitRepository.archive(parameters, callback);
    },
    function(callback) { // do checks
      checks(parameters, callback);
    },
    function(callback) { // add comments
      submitComments(parameters, callback);
    }
  ],
  function(err) {
    complete(err);
  });
}
