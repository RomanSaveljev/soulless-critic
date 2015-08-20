var ConfigurationLocator = require('./configuration-locator');
var shell = require('procstreams');
var xml = require('xmldom');
var xpath = require('xpath');
var path = require('path');
var buildComment = require('./build-comment');
var assert = require('better-assert');

module.exports = function(entry, parameters, complete) {
  assert(parameters.entries !== undefined);
  assert(parameters.entries[entry] !== undefined);
  assert(parameters.archive !== undefined);
  assert(parameters.checkStyle !== undefined);
  assert(parameters.checkStyle.enabled !== undefined);
  assert(parameters.checkStyle.jar !== undefined);
  assert(parameters.checkStyle.defaultConfiguration !== undefined);
  assert(parameters.checkStyle.configuration !== undefined);

  var filePath = path.join(parameters.archive, entry);
  var checkStyle = parameters.checkStyle;
  var locator = new ConfigurationLocator(checkStyle.configuration, checkStyle.defaultConfiguration);
  var configXml = locator.locate(path.dirname(filePath));

  // get XML report on STDOUT
  shell('java', ['-jar', checkStyle.jar, '-c', configXml, '-f', 'xml', filePath]).data(function(err, stdout, stderr) {
    parameters.entries[entry].comments = [];
    if (err) {
      // add diagnostics as a file level comment
      var diagnostics =
      err.toString() + '\n' +
      'STDOUT: ' + stdout + '\n' +
      'STDERR: ' + stderr + '\n';
      parameters.entries[entry].comments.push(buildComment(0, diagnostics));
    } else {
      //console.log(stdout);
      var parser = new xml.DOMParser();
      var doc = parser.parseFromString(stdout.toString());
      var errors = xpath.select('/checkstyle/file/error', doc);
      errors.forEach(function(errorNode) {
        var line = xpath.select1('@line', errorNode).value;
        var message = xpath.select1('@message', errorNode).value;
        parameters.entries[entry].comments.push(buildComment(line, message));
      });
    }
    complete(null);
  });
}
