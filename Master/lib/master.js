var redis = require('redis');
var log = require('./log').log;
var MQ = require('./rabbitMQ');

var redis_channel;
var subscribe_client;
var listen_client;
var hash_name;
var heartbeat = 10;

var listen = function() {
    listen_client.hkeys(hash_name, function(pError, pKeys) {
        var iKey = pKeys[0];
        iKey!==undefined && listen_client.hget(hash_name, iKey, function(ppError, ppValue) {
            if (ppError) {
                log(ppError);
                return;
            }
            var iVal = JSON.parse(ppValue);
            MQ.send(iVal.channel, JSON.stringify({data: iVal.message}), function() {
                listen_client.hdel(hash_name, iKey);
            });
        });
        setTimeout(listen, heartbeat);
    });
};

var push = function(pChannel, pMessage, pMessageType) {
    var iMessage = {
        channel: pChannel,
        message: pMessage,
        type: pMessageType
    };
    var iKey = 'key' + Math.random();
    listen_client.hsetnx(hash_name, iKey, JSON.stringify(iMessage), function(pError, pResult) {
        if (!pResult) {
            push(pChannel, pMessage, pMessageType);
        }
    });
};

var makeClient = function() {
    var iConfig = require('./config').get('redis');
    var iPort = iConfig['port'] || 6379;
    var iHost = iConfig['host'] || 'localhost';
    var iPassword = iConfig['password'];
    redis_channel = iConfig['channel'] || 'debade';
    hash_name = iConfig['hashTable'] || 'hash.master.debade';
    var iClient = redis.createClient(iPort, iHost);
    if (undefined!==iPassword) {
        iClient.auth(iPassword);
    }
    return iClient;
};

var runListen = function() {
    listen_client = makeClient();
    listen_client.on('error', function(pErr) {
        log('listen_client Connect to Redis Failed: ' + pErr);
    });

    listen_client.on('ready', function() {
        log('开始监听消息队列');
        listen();
    });

    listen_client.on('end', function() {
        runListen();
    });
};

var runSubscribe = function() {
    subscribe_client = makeClient();

    subscribe_client.on('message', function(pChannel, pMessage) {
        var iData = JSON.parse(pMessage);
        var iChannel = iData.channel;
        var iType = iData.type;
        var iContent = iData.content || {};
        var iMessage = iContent.data;
        var iTime = iContent.time;

        push(iChannel, iMessage, iType);
    });

    subscribe_client.on('error', function(pErr) {
        log('subscribe_client Connect to Redis Failed: ' + pErr);
    });

    subscribe_client.on('ready', function() {
        log('开始接受pub/sub消息');
        subscribe_client.subscribe(redis_channel);
    });

    subscribe_client.on('end', function() {
        run();
    });
};

var run = function() {
    runListen();
    runSubscribe();
};

exports.run = run;

