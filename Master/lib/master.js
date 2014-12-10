var redis = require('redis');
var log = require('./log').log;

var run = function() {
    var redis_channel;

    var client = (function() {
        var iConfig = require('./config').get('redis');
        var iPort = iConfig['port'] || 6379;
        var iHost = iConfig['host'] || 'localhost';
        var iPassword = iConfig['password'];
        redis_channel = iConfig['channel'] || 'debade';
        var iClient = redis.createClient(iPort, iHost);
        if (undefined!==iPassword) {
            iClient.auth(iPassword);
        }
        return iClient;
    })();

    log('启动debade-master服务');

    client.on('message', function(pChannel, pMessage) {
        var iData = JSON.parse(pMessage);
        var iChannel = iData.channel;
        var iType = iData.type;
        var iContent = iData.content || {};
        var iMessage = iContent.data;
        var iTime = iContent.time;
        var iMQ;

        switch (iType) {
            case 'message':
            default:
                iMQ = require('./rabbitMQ');
        }

        log('将redis消息转发给rabbitMQ');

        iMQ.send(iChannel, JSON.stringify({data: iMessage}));
    });

    client.on('error', function(pErr) {
        log('Connect to Redis Failed: ' + pErr);
    });

    client.on('ready', function() {
        log('开始接受redis消息');
        client.subscribe(redis_channel);
    });

    client.on('end', function() {
        run();
    });

};

exports.run = run;

