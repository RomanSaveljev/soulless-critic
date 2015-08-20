function buildComment(line, message) {
  var comment = {
    'line': line,
    'message': message
  };
  return comment;
}

module.exports = buildComment;
