var GerritEventEmitter = require('gerrit-event-emitter').GerritEventEmitter;
var fs = require('fs');
var child = require('child_process');
var path = require('path');

// TODO: this will come from config
var host = 'romasave@localhost';
var port = 29418;

var emitter = new GerritEventEmitter(host, port);

function log(message) {
    console.log(message);
}

function checkChange(eventData) {
    log('Received notification about change: ' + eventData.change.id);
    log('   - project: ' + eventData.change.project);

    // TODO: Use PID for concurrency
    var gitDir = path.join('projects', host, port, eventData.change.project);
    fs.mkdirSync(path.join
}

emitter.on('patchsetCreated', checkChange);

emitter.start();
