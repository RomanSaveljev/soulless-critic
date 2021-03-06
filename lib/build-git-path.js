var assert = require('better-assert');
var path = require('path');

module.exports = function(url) {
  assert(url !== undefined);

  var hostPort = path.join(url.hostname(), url.port() || 'default');
  var cloneTo = path.join('projects', hostPort, url.path(), 'git');
  return cloneTo;
};
