#! /usr/bin/env node

var http = require('http');
var qs = require('querystring');
var readline = require('readline-sync');

var getInput = function(pTitle, pExample, pDefault) {
    var iAsk = pTitle;
    if (pExample) {
        iAsk = pTitle + ' <e.g.: ' + pExample + '>';
    }

    if (pDefault) {
        iAsk += ' <default: ' + pDefault + '>';
    }

    var iData = readline.question(iAsk + ': ');
    if (!iData) {
        if (!pDefault) return getInput(pTitle, pExample, pDefault);
        iData = pDefault;
    }

    return iData;
};

var urlPattern = /^http:\/\/([^\:\/]+)(?:\:(\d+))?(\/.+)?$/;


var channel = getInput('RabbitMQ Channel', 'default');
var callbackType = getInput('Callback Type', 'http-jsonrpc | rest', 'http-jsonrpc');
var callbackURL;
var host, port, path;

while (true) {
    callbackURL = getInput('Callback URL');
    var matches = callbackURL.match(urlPattern);
    if (!matches) continue;
    host = matches[1];
    port = matches[2] ? matches[2] : 80;
    path = matches[3] ? matches[3] : '/';
    break;
}

var data = {
    'channel': channel,
    'callback': callbackType + ':' + JSON.stringify({
        'host': host,
        'port': port,
        'path': path,
        'token': getInput('Callback Token', 'random value')
    })
};

while (true) {
    var to = getInput('Register/UnRegister to Debade Agent', 'http://172.17.42.1:8877/register | http://172.17.42.1:8877/unregister');
    var matches = to.match(urlPattern);
    if (!matches) continue;
    host = matches[1];
    port = matches[2] ? matches[2] : 80;
    path = matches[3] ? matches[3] : '/';
    break;
}

console.log("\n");
console.log('WILL POST ' + JSON.stringify(data) + ' TO ' + to);

data = qs.stringify(data);

var options = {
    host: host,
    port: port,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }
};

var request = http.request(options, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(pData) {
    });
});

request.on('error', function(error) {
    console.log(error);
});

request.write(data);
request.end();

