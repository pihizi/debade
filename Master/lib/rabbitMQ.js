var amqp = require('amqplib');
var deferred = require('deferred');
var log = require('./log').log;

var url = (function() {
    var iConfig = require('./config').get('master');
    var iServer = iConfig['server'] || 'localhost';
    var iUser = iConfig['user'] || 'guest';
    var iPassword = iConfig['password'] || 'guest';
    var iPort = iConfig['port'] || '5672';
    return 'amqp://' + iUser + ':' + iPassword + '@' + iServer + ':' + iPort;
})();

var connection, channel;
var getHandler = function(pDef) {
    var iDef = pDef || deferred();
    if (!channel) {
        log('初始化rabbitMQ Channel');
        connection = amqp.connect(url).then(function(pConn) {
            pConn.createChannel().then(function(pChannel) {
                log('初始化rabbitMQ Channel成功');
                channel = pChannel;
                iDef.resolve();
            });
        }, function(pError) {
            log(pError);
            getHandler(iDef);
        });
    }
    else {
        iDef.resolve();
    }
    return iDef.promise;
};

exports.send = function(pExchangeName, pMessage, pCallback) {
    getHandler().then(function() {
        var iOk = channel.assertExchange(pExchangeName, 'fanout', {
            durable: false,
            autoDelete: true
        });
        iOk.then(function() {
            log('.');
            var iResult = channel.publish(pExchangeName, '', new Buffer(pMessage));
            if (false!==iResult) {
                pCallback();
            }
        });
    });
};


