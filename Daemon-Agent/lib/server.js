var cbk = require('./callback');
var http = require('http');
var qs = require('querystring');
var url = require('url');
var log = require('./log').log;

var refreshCallbacks = function() {
    process.send('CALLBACK_UPDATE');
};

var server = http.createServer();
server.on('request', function(pRequest, pResponse) {
    var iMethod = pRequest.method;
    if (iMethod!=='POST') {
        //pResponse.setHeader("Content-Type", "text/html");
        //pResponse.write('<form method="POST" type="application/json"> <input name="channel" value="test" /> <input name="callback" value="rest:{}"/> <input name="token" value="token"/> <input type="submit" /> </form>');
        pResponse.end();
        log('Server仅接收POST请求!');
        return;
    }

    var iData = '';
    pRequest.on('data', function(pChunk) {
        iData += pChunk;
    });

    pRequest.on('end', function() {
        var iPath = url.parse(pRequest.url).pathname.substr(1).toLowerCase();
        iData = qs.parse(iData.toString());
        switch (iPath) {
            case 'register':
                log('Register New Callback.');
                if (cbk.set(iData)) {
                    refreshCallbacks();
                }
                break;
            case 'unregister':
                log('UnRegister Callback.');
                if (cbk.unset(iData)) {
                    refreshCallbacks();
                }
                break;
            default:
                log('Unsupported Request Path: ' + iPath);
        }
        pResponse.end();
    });
});

server.on('error', function(pError) {
    log('Server Error: ' + pError.message);
});

var config = require('./config').get('server');
var port = config.port || 80;
log('启动server, 监听' + port + '端口, 接收register/unregister请求。');
server.listen(port);

