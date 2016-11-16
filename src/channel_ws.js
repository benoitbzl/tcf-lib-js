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

var transport = {
    name: 'WS',
    connect: connectClientWS
};

if (webSocket.Server) {
    transport.create = require('./channel_server_ws.js');
}

channel.add_transport(transport);

channel.add_transport({
    name: 'WSS',
    connect: connectClientWS
});

function connectClientWS(ps, options) {
    var host = ps.getprop('Host') || "127.0.0.1";
    var port = ps.getprop('Port') || (ps.getprop('TransportName').toLowerCase() == 'ws' ? 80 : 443);

    if (!ps.url) {
        ps.url = ps.getprop('TransportName').toLowerCase() + "://" + host + ':' + port;
    }

    var clientChannel = {
        ps: ps,
        ws: null,
        onconnect: null,
        channel: null,

    };

    clientChannel.ws = new webSocket(ps.url, "tcf", options);
    clientChannel.ws.binaryType = 'arraybuffer';

    clientChannel.ws.onopen =  function() {
        // Successful connection to the peer

        clientChannel.channel = new channel.Channel();

        clientChannel.channel.closeConnection = function wsCloseConnection() {
            clientChannel.ws.close();
        };

        clientChannel.channel.flushOutput = function wsFlushOutput(typedArray) {
            clientChannel.ws.send(typedArray.buffer);
        };

        clientChannel.onconnect(null, clientChannel.channel);
    };

    clientChannel.ws.onmessage = function(event) {
        clientChannel.channel.onData(event.data);
    };

    clientChannel.ws.onclose = function() {
        clientChannel.channel && clientChannel.channel.onClosed();
    };

    clientChannel.ws.onerror = function(error) {
        if (clientChannel.channel) {
            clientChannel.channel.onError(error);
        }
        else {
            clientChannel.onconnect(error, null);
        }
    };

    return clientChannel;
}
