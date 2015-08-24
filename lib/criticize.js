var assert = require('better-assert');
var fetchGit = require('./fetch-git');
var async = require('async');
var checks = require('./checks');
var submitComments = require('./submit-comments');

module.exports = function(parameters, complete) {
  assert(parameters !== undefined);

  async.series([
    function(callback) { // prepare repository snapshot
      fetchGit(parameters, callback);
    },
    function(callback) { // do checks
      checks(parameters, callback);
    },
    function(callback) { // publish comments
      submitComments(parameters, callback);
    }
  ],
  function(err) {
    complete(err);
  });
};
