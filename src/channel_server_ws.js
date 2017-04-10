/**
 * Copyright (c) 2016 Wind River Systems
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var webSocket = require('ws');
var channel = require('./channel.js');
var https = require('https');
const url = require('url');

module.exports = function channel_create_ws_server(ps, options) {
    var host = ps.getprop('Host');
    var port = ps.getprop('Port');

    if (!port) {
        port = 80;
    }

    if (!ps.url) {
        ps.url = ps.getprop('TransportName').toLowerCase() + "://" + host + ':' + port;
    }

    var parsedUrl = require('url').parse(ps.url);

    var wsOptions = {
        port: port,
        handleProtocols: function(subprotocols, cb) {

            if (subprotocols.length == 1 && subprotocols[0] == "") {
                return cb(true, "");
            }

            return cb(subprotocols.length == 1 && subprotocols[0] == "tcf", "tcf");
        }
    };

    if (host) {
        wsOptions.host = host;
    }

    if (parsedUrl.pathname) {
        wsOptions.path = parsedUrl.pathname;
    }

    var serverChannel = {
        ps: ps,
        server: null,
        onconnection: null,
        channel: null
    };

    /* for WSS connection create a https server separatly */
    if(ps.getprop('TransportName') === 'WSS') {
        var options = ps.getprop('options');
        if (!options || !options.key || !options.cert) throw 'options.key and options.cert are mandatory for wss server';
        var httpsServer = https.createServer(Object.assign(wsOptions, options)).listen(wsOptions.port);
        serverChannel.server = new webSocket.Server({server: httpsServer});
    }
    else {
        serverChannel.server = new webSocket.Server(wsOptions);
    }

    serverChannel.server.on('connection', function(wsSocket) {
        // A new connection
        var c = new channel.Channel();

        // Build the connection parameters from the url
        c.connectionParams = url.parse(wsSocket.upgradeReq.url, true, true).query;
        c.connectionParams._url = wsSocket.upgradeReq.url;
        
        wsSocket.onclose = function() {
            c.onClosed();
        };

        wsSocket.onmessage = function(event) {
            c.onData(event.data);
        };

        wsSocket.onerror = function(error) {
            c.onError(error);
        };

        c.closeConnection = function wsCloseConnection() {
            wsSocket.close();
        };

        c.flushOutput = function wsFlushOutput(typedArray) {
            wsSocket.send(typedArray.buffer);
        };

        serverChannel.onconnection(serverChannel, c);
    });


    serverChannel.server.on('error', function(error) {
        console.error("Error of WS server:", error);
    });

    return serverChannel;
};
