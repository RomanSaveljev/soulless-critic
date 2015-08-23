var async = require('async');
var assert = require('better-assert');
var path = require('path');
var Linguist = require('node-linguist');
var checkStyle = require('./check-style');

var linguist = new Linguist();

function processEntry(entry, parameters, complete) {
  var filePath = path.join(parameters.repository().path(), entry);
  linguist.detect(filePath, function(err, response) {
    if (err) {
      complete(err);
    } else {
      switch (response.language) {
        case 'Java':
          checkStyle(entry, parameters, complete);
          break;
        // TODO: add more languages here
        default:
          complete(null);
          break;
      }
    }
  });
}

module.exports = function(parameters, complete) {
  assert(parameters.repository().path() !== undefined);

  // analyze all files at once
  var unit = function(entry, callback) {
    processEntry(entry, parameters, callback);
  };
  async.map(parameters.review().modified(), unit, function(err) {
    complete(err);
  });
}
