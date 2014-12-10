#! /usr/bin/env node

var args = process.argv.slice(2);
if (!args.length) {
    console.error('Usage: debade-master start|stop|restart');
    process.exit(1);
}

var action = args.shift().toLowerCase();

var options = {
    PARENT_PROCESS_ID: process.pid,
    ACTION: action
};

args.map(function(arg) {
    switch(arg) {
    case '-D':
        options.isDaemon = true;
        break;
    }
});

var fs = require('fs');
var path = require('path');

var bin_path = path.dirname(fs.realpathSync(__filename));

var start = function() {
    var spawn = require('child_process').spawn;
    var handler = spawn('node', [bin_path + '/daemon.js', action], {
        detached: true,
        env: options,
        stdio: ['ipc', 'ignore', 'ignore']
    });

    handler.unref();

    handler.on('message', function(pMsg) {
        console.log(pMsg);
    });

    handler.on('error', function(pCode, pSignal) {
        handler.kill(pSignal);
        start();
    });
};


start();

