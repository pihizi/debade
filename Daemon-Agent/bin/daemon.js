#! /usr/bin/env node

var action = process.env.ACTION;
var parent_id = process.env.PARENT_PROCESS_ID;
var is_daemon = process.env.isDaemon;

var fs = require('fs');
var path = require('path');

var lib_path = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var log = require(lib_path + '/log').log;

var daemon = require(lib_path + '/daemon');

var apps = [lib_path + '/agent', lib_path + '/server'];

if (action=='start') {
    process.send('Starting...');
    daemon.start(apps);
    process.send('Agent is running...');
}
if (action=='stop') {
    process.send('Stopping...');
    daemon.stop();
    process.send('Agent is stopped.');
}
if (action==='restart') {
    process.send('Stopping...');
    daemon.stop();
    process.send('Starting...');
    daemon.start(apps)
    process.send('Agent is running...');
}

is_daemon && setTimeout(function() {
    process.kill(process.env.PARENT_PROCESS_ID);
}, 10);
