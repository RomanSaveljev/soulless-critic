module.exports = function(/* vararg */) {
  var node = this;
  for (var i = 0; i < arguments.length - 2; i++) {
    var argument = arguments[i];
    node[argument] = node[argument] || {};
    node = node[argument];
  }
  var property = arguments[arguments.length - 2];
  var value = arguments[arguments.length - 1];
  node[property] = value;
  return this;
}
