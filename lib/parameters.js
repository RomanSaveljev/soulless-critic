var plantValue = require('./plant-value');
var extractValue = require('./extract-value');
var sprintf = require('sprintf-js').sprintf;
var URI = require('URIjs');
var clone = require('clone');
var assert = require('better-assert');
var path = require('path');

var CHANGE_NUMBER = ['eventData', 'change', 'number'];
var PATCH_NUMBER = ['eventData', 'patchSet', 'number'];
var PATCH_REF = ['eventData', 'patchSet', 'ref'];
var CHANGE_PROJECT = ['eventData', 'change', 'project'];
var GIT_SERVER = ['git', 'server'];
var GIT_PROJECT_CLONE = ['git', 'project', 'clone'];
var GIT_PROJECT_PATH = ['git', 'project', 'path'];
var REVIEW_COMMENTS = ['reviewInput', 'comments'];
var REVIEW_MESSAGE = ['reviewInput', 'message'];
var REVIEW_MODIFIED = ['reviewInput', 'modified'];
var CHECKSTYLE_ENABLED = ['checkstyle', 'enabled'];
var CHECKSTYLE_JAR = ['checkstyle', 'jar'];
var CHECKSTYLE_DEFAULT_XML = ['checkstyle', 'defaultXml'];
var CHECKSTYLE_XML = ['checkstyle', 'xml'];

function buildDefaultRefspec(change, patch) {
  if (change !== undefined && patch !== undefined) {
    return sprintf('refs/changes/%02d/%d/%d', change % 100, change, patch);
  } else {
    return undefined;
  }
}

function buildDefaultProjectUrl(baseUrl, project) {
  if (baseUrl !== undefined && project !== undefined) {
    var url = clone(baseUrl);
    return url.path((url.path() || '') + '/' + project).normalizePath();
  } else {
    return undefined;
  }
}

function Review(parameters) {
  this.parameters = parameters;
  this.change = function(number) {
    if (number === undefined) {
      return extractValue.apply(this.parameters, CHANGE_NUMBER);
    } else {
      return plantValue.apply(this.parameters, CHANGE_NUMBER.concat(number));
    }
  };
  this.patch = function(number) {
    if (number === undefined) {
      return extractValue.apply(this.parameters, PATCH_NUMBER);
    } else {
      return plantValue.apply(this.parameters, PATCH_NUMBER.concat(number));
    }
  };
  this.ref = function(refspec) {
    if (refspec === undefined) {
      return extractValue.apply(this.parameters, PATCH_REF) || buildDefaultRefspec(this.change(), this.patch());
    } else {
      return plantValue.apply(this.parameters, PATCH_REF.concat(refspec));
    }
  };
  this.project = function(project) {
    if (project === undefined) {
      return extractValue.apply(this.parameters, CHANGE_PROJECT);
    } else {
      return plantValue.apply(this.parameters, CHANGE_PROJECT.concat(project));
    }
  };
  this.modified = function() {
    var ret = extractValue.apply(this.parameters, REVIEW_MODIFIED);
    if (ret === undefined) {
      ret = [];
      var location = clone(REVIEW_MODIFIED);
      location.push(ret);
      plantValue.apply(this.parameters, location);
    }
    return ret;
  };
  this.message = function(message) {
    if (message === undefined) {
      return extractValue.apply(this.parameters, REVIEW_MESSAGE);
    } else {
      return plantValue.apply(this.parameters, REVIEW_MESSAGE.concat(message));
    }
  };
  this.comments = function(file) {
    assert(file !== undefined);
    var ret = extractValue.apply(this.parameters, REVIEW_COMMENTS.concat(file));
    if (ret === undefined) {
      ret = [];
      var location = REVIEW_COMMENTS.concat(file);
      location.push(ret);
      plantValue.apply(this.parameters, location);
    }
    return ret;
  };
}

function Project(parameters, project) {
  this.parameters = parameters;
  this.project = project;
  this.url = function(url) {
    var project = this.project || this.parameters.review().project();
    if (project === undefined) {
      return undefined;
    } else if (url === undefined) {
      var ret = extractValue.apply(this.parameters, GIT_PROJECT_CLONE.concat(project)) ||
        buildDefaultProjectUrl(this.parameters.configuration().git().server(), project);
      return ret && URI(ret);
    } else {
      return plantValue.apply(this.parameters, GIT_PROJECT_CLONE.concat(project, url));
    }
  };
}

function Git(parameters) {
  this.parameters = parameters;
  this.server = function(server) {
    if (server === undefined) {
      var ret = extractValue.apply(this.parameters, GIT_SERVER);
      return ret && URI(ret);
    } else {
      return plantValue.apply(this.parameters, GIT_SERVER.concat(server.toString()));
    }
  };
  this.project = function(project) {
    return new Project(this.parameters, project);
  };
}

function CheckStyle(parameters) {
  this.parameters = parameters;
  this.enabled = function(enabled) {
    if (enabled === undefined) {
      return extractValue.apply(this.parameters, CHECKSTYLE_ENABLED) || false;
    } else {
      return plantValue.apply(this.parameters, CHECKSTYLE_ENABLED.concat(enabled));
    }
  };
  this.jar = function(jar) {
    if (jar === undefined) {
      return extractValue.apply(this.parameters, CHECKSTYLE_JAR);
    } else {
      return plantValue.apply(this.parameters, CHECKSTYLE_JAR.concat(jar));
    }
  };
  this.defaultXml = function(value) {
    if (value === undefined) {
      return extractValue.apply(this.parameters, CHECKSTYLE_DEFAULT_XML) || '/sun_checks.xml';
    } else {
      return plantValue.apply(this.parameters, CHECKSTYLE_DEFAULT_XML.concat(value));
    }
  };
  this.xml = function(value) {
    if (value === undefined) {
      return extractValue.apply(this.parameters, CHECKSTYLE_XML) || 'checkstyle.xml';
    } else {
      return plantValue.apply(this.parameters, CHECKSTYLE_XML.concat(value));
    }
  };
}

function Configuration(parameters) {
  this.parameters = parameters;
  this.git = function() {
    return new Git(parameters);
  };
  this.checkstyle = function() {
    return new CheckStyle(parameters);
  };
}

function Repository(parameters) {
  this.parameters = parameters;
  this.url = function() {
    var project = new Project(this.parameters, this.parameters.review().project());
    return project.url();
  };
  this.path = function(path) {
    if (path === undefined) {
      return extractValue.apply(this.parameters, GIT_PROJECT_PATH);
    } else {
      return plantValue.apply(this.parameters, GIT_PROJECT_PATH.concat(path));
    }
  };
}

function Parameters() {
}

Parameters.prototype.review = function() {
  return new Review(this);
};

Parameters.prototype.configuration = function() {
  return new Configuration(this);
};

Parameters.prototype.repository = function() {
  return new Repository(this);
};

module.exports = Parameters;
