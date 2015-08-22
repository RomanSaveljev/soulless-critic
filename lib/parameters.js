var plantValue = require('./plant-value');
var extractValue = require('./extract-value');
var sprintf = require('sprintf-js').sprintf;

var CHANGE_NUMBER = ['eventData', 'change', 'number'];
var PATCH_NUMBER = ['eventData', 'patchSet', 'number'];
var PATCH_REF = ['eventData', 'patchSet', 'ref'];

function buildDefaultRefspec(change, patch) {
  if (change !== undefined && patch !== undefined) {
    return sprintf('refs/changes/%02d/%d/%d', change % 100, change, patch);
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

module.exports = Parameters;
