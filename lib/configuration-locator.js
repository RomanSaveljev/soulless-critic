var path = require('path');
var fileExists = require('file-exists');

function ConfigurationLocator(configuration, defaultConfiguration) {
  this.configuration = configuration;
  this.defaultConfiguration = defaultConfiguration;
}

ConfigurationLocator.prototype.locate = function(startingDir) {
  if (startingDir !== '.' && startingDir !== '/') {
    var candidate = path.join(startingDir, this.configuration);
    if (!fileExists(candidate)) {
      return this.locate(path.dirname(startingDir));
    } else {
      return candidate;
    }
  } else {
    return this.defaultConfiguration;
  }
}

module.exports = ConfigurationLocator;
