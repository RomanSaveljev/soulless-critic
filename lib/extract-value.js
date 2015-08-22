var assert = require('better-assert');

function extractValue(/* vararg */) {
  var property = arguments[0];
  if (arguments.length == 1) {
    return this[property];
  } else {
    var node = this[property];
    var args = new Array();
    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return node && extractValue.apply(node, args);
  }
};

module.exports = extractValue;
