var shell = require('procstreams');

function processError(message, err, stdout, stderr) {
  var error = null;
  stderr = stderr || '';
  if (err) {
    var error = new Error(message + '\n' + stderr);
  }
  return error;
}

exports.initBareRepo = function(cloneTo, complete) {
  shell('git', ['init', '--bare', cloneTo]).data(function(err, stdout, stderr) {
    complete(processError('Could not initialize bare repository at ' + cloneTo, err, stdout, stderr));
  });
};

exports.fetchRefspec = function(opts, complete) {
  shell('git', ['--git-dir', opts.cloneTo, 'fetch', '-f', opts.url, opts.refspec]).data(function(err, stdout, stderr) {
    complete(processError('Could not fetch ' + opts.refspec + ' from ' + opts.url, err, stdout, stderr));
  });
};

exports.diffBranch = function(cloneTo, branch, complete) {
  shell('git', ['--git-dir', cloneTo, 'diff', '--name-status', branch + '^', branch]).data(function(err, stdout, stderr) {
    complete(processError('Could not diff ' + branch, err, stdout, stderr), stdout);
  });
};

exports.makeTemporaryFolder = function(baseDir, complete) {
  mktemp.createDir(baseDir + '/XXXXXXX', function(err, tmpPath) {
    complete(processError('Could not make temporary folder in ' + baseDir, err), tmpPath);
  });
};

exports.archiveRepo = function(from, branch, to, complete) {
  shell('git', ['archive', '--format=tar', '--remote', from, branch])
    .pipe('tar', ['x', '-C', to])
    .data(function(err, stdout, stderr) {
      complete(processError('Could not archive ' + from + ' to ' + to, stdout, stderr));
    });
};
