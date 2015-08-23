var ConfigurationLocator = require('./configuration-locator');
var shell = require('procstreams');
var DOMParser = require('xmldom').DOMParser;
var xpath = require('xpath');
var path = require('path');
var buildComment = require('./build-comment');
var assert = require('better-assert');

module.exports = function(entry, parameters, complete) {
  assert(parameters.repository().path() !== undefined);
  assert(parameters.configuration().checkstyle() !== undefined);

  var filePath = path.join(parameters.repository().path(), entry);
  var checkStyle = parameters.configuration().checkstyle();
  var locator = new ConfigurationLocator(checkStyle.xml(), checkStyle.defaultXml());
  var configXml = locator.locate(path.dirname(filePath));

  // get XML report on STDOUT
  shell('java', ['-jar', checkStyle.jar(), '-c', configXml, '-f', 'xml', filePath]).data(function(err, stdout, stderr) {
    var comments = parameters.review().comments(entry);
    var parser = new DOMParser();
    var doc = parser.parseFromString(stdout.toString());
    var errors = xpath.select('/checkstyle/file/error', doc);
    errors.forEach(function(errorNode) {
      var line = xpath.select1('@line', errorNode).value;
      var message = xpath.select1('@message', errorNode).value;
      var severity = xpath.select1('@severity', errorNode).value;
      comments.push(buildComment(line, severity + ': ' + message));
    });
    complete(null);
  });
}
