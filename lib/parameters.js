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
var GIT_BASE = ['git', 'base'];
var GIT_CLONE = ['git', 'clone'];

function buildDefaultRefspec(change, patch) {
  if (change !== undefined && patch !== undefined) {
    return sprintf('refs/changes/%02d/%d/%d', change % 100, change, patch);
  } else {
    return undefined;
  }
}

function buildDefaultCloneProject(baseUrl, project) {
  if (baseUrl !== undefined && project !== undefined) {
    var url = clone(baseUrl);
    return url.path((url.path() || '') + '/' + project).normalizePath();
  } else {
    return undefined;
  }
}

function Parameters() {

}

Parameters.prototype.change = function(number) {
  if (number === undefined) {
    return extractValue.apply(this, CHANGE_NUMBER);
  } else {
    return plantValue.apply(this, CHANGE_NUMBER.concat(number));
  }
};

Parameters.prototype.patch = function(number) {
  if (number === undefined) {
    return extractValue.apply(this, PATCH_NUMBER);
  } else {
    return plantValue.apply(this, PATCH_NUMBER.concat(number));
  }
};

Parameters.prototype.ref = function(refspec) {
  if (refspec === undefined) {
    return extractValue.apply(this, PATCH_REF) || buildDefaultRefspec(this.change(), this.patch());
  } else {
    return plantValue.apply(this, PATCH_REF.concat(refspec));
  }
};

Parameters.prototype.project = function(project) {
  if (project === undefined) {
    return extractValue.apply(this, CHANGE_PROJECT);
  } else {
    return plantValue.apply(this, CHANGE_PROJECT.concat(project));
  }
};

Parameters.prototype.gitCloneBase = function(base) {
  if (base === undefined) {
    return URI(extractValue.apply(this, GIT_BASE));
  } else {
    return plantValue.apply(this, GIT_BASE.concat(base.toString()));
  }
};

Parameters.prototype.gitCloneProject = function(project, url) {
  project = project || this.project();
  if (project === undefined) {
    return undefined;
  } else if (url === undefined) {
    var ret = extractValue.apply(this, GIT_CLONE.concat(project)) ||
      buildDefaultCloneProject(this.gitCloneBase(), this.project());
    return URI(ret);
  } else {
    return plantValue.apply(this, GIT_CLONE.concat(project, url));
  }
};

Parameters.prototype.gitClonePath = function() {
  // TODO: does it need setter?
  var url = this.gitCloneProject();
  var hostPort = path.join(url.hostname(), url.port() || 'default');
  return path.join('projects', hostPort, url.path());
};

Parameters.prototype.gitCloneBranch = function() {
  // TODO: need setter?
  if (this.change() !== undefined && this.patch() !== undefined) {
    return this.change() + '/' + this.patch();
  }
}

module.exports = Parameters;
