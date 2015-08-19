var GerritEventEmitter = require('gerrit-event-emitter').GerritEventEmitter;
var fs = require('fs');
var child = require('child_process');
var URI = require('URIjs');
var path = require('path');

// TODO: this will come from config
var host = 'romasave@localhost';
var port = 29418;

function log(message) {
    console.log(message);
}

function syncCommand(cmd, args) {
    var result = child.spawnSync(cmd, args);
    if (result.status == 0) {
        return true;
    } else {
        log(cmd, args.join(' '), 'failed with ' + result.status);
        log(result.stdout.toString());
        log(result.stderr.toString());
        return false;
    }
}

function checkChange(eventData) {
    log('Received notification about change: ' + eventData.change.id);
    log('   - project: ' + eventData.change.project);
    log('   - ref: ' + eventData.patchSet.ref);

    var gitWorkTree = path.resolve(path.join('projects', host, port.toString(), eventData.change.project));
    var uri = URI()
        .scheme('ssh')
        .host(host)
        .port(port)
        .path('/' + eventData.change.project);

    var commonArgs = ['--work-tree', gitWorkTree, '--git-dir', gitWorkTree + '/.git'];
    syncCommand('git', commonArgs.concat(['init'])) &&
    syncCommand('git', commonArgs.concat(['fetch', uri.toString(), eventData.patchSet.ref])) &&
    syncCommand('git', commonArgs.concat(['checkout', 'FETCH_HEAD']));

    log('Change handling is complete');
}

var emitter = new GerritEventEmitter(host, port);
emitter.on('patchsetCreated', checkChange);
emitter.start();
