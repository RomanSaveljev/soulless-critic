var GerritEventEmitter = require('gerrit-event-emitter').GerritEventEmitter;
var fs = require('fs');
var child = require('child_process');
var URI = require('URIjs');
var path = require('path');
var Linguist = require('node-linguist');
var linguist = new Linguist();
var async = require('async');
var ReadWriteLock = require('rwlock');

// TODO: this will come from config
var host = 'romasave@localhost';
var port = 29418;
var checkStyle = {
    enabled: true,
    jar: '/home/user/code/soulless-critic/checkstyle-6.9-all.jar',
    configuration: '/google_checks.xml'
};

function log(message) {
    console.log(message);
}

function syncCommand(cmd, args, cb) {
    var result = child.spawnSync(cmd, args);
    if (result.status == 0) {
        if (cb !== undefined) {
            cb(result);
        }
        return true;
    } else {
        log(cmd, args.join(' '), 'failed with ' + result.status);
        log(result.stdout.toString());
        log(result.stderr.toString());
        return false;
    }
}

var lock = new ReadWriteLock();
function lockedCheckChange(eventData) {
    lock.readlock(checkChange(eventData, release);
}

function checkChange(eventData, release) {
    log(JSON.stringify(eventData, null, 2));
    log('Received notification about change: ' + eventData.change.id);
    log('   - project: ' + eventData.change.project);
    log('   - ref: ' + eventData.patchSet.ref);
    var reportAndRelease = function() {
        log('Change ' + eventData.change.id + ' handling is complete');
        release();
    };

    var gitWorkTree = path.resolve(path.join('projects', host, port.toString(), eventData.change.project));
    var uri = URI()
        .scheme('ssh')
        .host(host)
        .port(port)
        .path('/' + eventData.change.project);

    // GIT repository access is mutually exclusive, so no need for async here
    var commonArgs = ['--work-tree', gitWorkTree, '--git-dir', gitWorkTree + '/.git'];
    syncCommand('git', commonArgs.concat(['init'])) &&
    syncCommand('git', commonArgs.concat(['fetch', uri.toString(), eventData.patchSet.ref])) &&
    syncCommand('git', commonArgs.concat(['checkout', 'FETCH_HEAD'])) &&
    syncCommand('git', commonArgs.concat(['diff', '--name-status', 'FETCH_HEAD^', 'FETCH_HEAD']), function(result) {
        var entries = result.stdout.toString().split('\n');
        return checkGitDiffEntries(entries, gitWorkTree, reportAndRelease);
    }) || reportAndRelease();

}

function checkGitDiffEntries(entries, gitWorkTree, release) {
    var checkEntryProxy = function(entry, callback) {
        return checkEntry(entry, gitWorkTree, callback);
    };
    async.map(entries, checkEntryProxy, function(err, allComments) {

    });
}

var checkEntry(entry, gitWorkTree, callback) {
    if (element !== '') {
        var parts = element.split(/\s+/);
        if (parts[0] !== 'D') {
            checkFile(gitWorkTree, parts[1], callback);
            return;
        }
    }
    callback(null, {});
}

function checkFile(workTree, localPath, callback) {
    var filePath = path.join(workTree, localPath);
    linguist.detect(filePath, function(err, response) {
        if (err === null) {
            switch (response.language) {
                case 'Java':
                    runCheckStyle(workTree, localPath, callback);
                    break;
                default:
                    log('No checker for ' + response.language);
                    callback(null, {});
                    break;
            }
        } else {
            callback(err, {});
        }
    });
}

function runCheckStyle(workTree, localPath, callback) {
}

var testEventData =
{
  "uploader": {
    "name": "Roman Saveljev",
    "email": "admin@example.com",
    "username": "romasave"
  },
  "patchSet": {
    "number": "4",
    "revision": "e48f0a5284d26b1bc942320f87b20ef00c17f485",
    "parents": [
      "0d2df990135adab31ffcadd0d08ba4604d72bad2"
    ],
    "ref": "refs/changes/03/3/4",
    "uploader": {
      "name": "Roman Saveljev",
      "email": "admin@example.com",
      "username": "romasave"
    },
    "createdOn": 1440010223,
    "author": {
      "name": "Roman Saveljev",
      "email": "roman.saveljev@haltian.com",
      "username": ""
    },
    "isDraft": false,
    "kind": "NO_CODE_CHANGE",
    "sizeInsertions": 1,
    "sizeDeletions": -1
  },
  "change": {
    "project": "java-design-patterns",
    "branch": "master",
    "id": "I1d1ef6cc34093a1201a67e40c486d3b8e98b322e",
    "number": "3",
    "subject": "apom.xml aa",
    "owner": {
      "name": "Roman Saveljev",
      "email": "admin@example.com",
      "username": "romasave"
    },
    "url": "http://127.0.0.1:8080/3",
    "commitMessage": "apom.xml aa\n\nChange-Id: I1d1ef6cc34093a1201a67e40c486d3b8e98b322e\n",
    "status": "NEW"
  },
  "type": "patchset-created",
  "eventCreatedOn": 1440010223
};
checkChange(testEventData);

var emitter = new GerritEventEmitter(host, port);
emitter.on('patchsetCreated', checkChange);
emitter.start();
