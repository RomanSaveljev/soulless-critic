var async = require('async');
var assert = require('better-assert');
var path = require('path');
var Linguist = require('node-linguist');
var fs = require('fs');
var shell = require('procstreams');
var checkStyle = require('./check-style.js');

var linguist = new Linguist();

function processEntry(entry, parameters, complete) {
  async.series([
    function(callback) { // detect file language
      var filePath = path.join(parameters.archive, entry);
      linguist.detect(filePath, function(err, response) {
        if (err) {
          callback(err);
        } else {
          parameters.entries[entry].language = response.language;
          callback(err);
        }
      });
    },
    function(callback) { // run a file through correct checker application
      switch (parameters.entries[entry].language) {
        case 'Java':
          checkStyle(entry, parameters, callback);
          break;
        default:
          callback(null);
          break;
      }
    }
  ],
  function (err) {
    complete(err);
  });
}

module.exports = function(parameters, complete) {
  assert(parameters.archive !== undefined);
  assert(parameters.entries !== undefined);

  // do not look, if deleted
  var entries = [];
  for (var entry in parameters.entries) {
    if (parameters.entries[entry].modification !== 'D') {
      entries.push(entry);
    }
  }

  // analyze all files at once
  async.map(entries, function(entry, callback) {processEntry(entry, parameters, callback)}, function(err) {
    complete(err);
  });
}
