var plantValue = require('./plant-value');
var extractValue = require('./extract-value');
var sprintf = require('sprintf-js').sprintf;
var URI = require('URIjs');
var clone = require('clone');

var CHANGE_NUMBER = ['eventData', 'change', 'number'];
var PATCH_NUMBER = ['eventData', 'patchSet', 'number'];
var PATCH_REF = ['eventData', 'patchSet', 'ref'];
var CHANGE_PROJECT = ['eventData', 'change', 'project'];
var GIT_BASE = ['git', 'base'];

function buildDefaultRefspec(change, patch) {
  if (change !== undefined && patch !== undefined) {
    return sprintf('refs/changes/%02d/%d/%d', change % 100, change, patch);
  } else {
    return undefined;
  }
}

function Repository(baseUrl, project) {
  if (baseUrl === undefined) {
    this.url = function() {
      return undefined;
    }
  } else {
    this.baseUrl = URI(baseUrl.toString());
    if (project === undefined) {
      this.url = function() {
        return this.baseUrl;
      };
    } else {
      this.project = project;
      this.url = function() {
        var url = clone(this.baseUrl);
        return url.path(url.path + '/' + this.project).normalizePath();
      };
    }
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
    return extractValue.apply(this, GIT_BASE);
  } else {
    return plantValue.apply(this, GIT_BASE.concat(base));
  }
};

Parameters.prototype.repository = function() {
  if (this.project() === undefined) {
    return new Repository();
  } else if (this.git.clone[project] !== undefined) {
    // config may have explicit clone URL for project
    return new Repository(this.git.clone[project]);
  } else {
    return new Repository(this.git.base, this.project());
  }
};

module.exports = Parameters;
