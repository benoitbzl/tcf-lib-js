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
var channel = require('./channel.js');

channel.add_transport({
    name: 'TCP',
    create: createServerTCP,
    connect: connectClientTCP
});

function connectClientTCP(ps, options) {
    var host = ps.getprop('Host') || "127.0.0.1";
    var port = ps.getprop('Port') || 1534;

    var clientChannel = {
        ps: ps,
        socket: null,
        onconnect: null,
        channel: null
    };

    clientChannel.socket = require('net').connect(port, host, function() {
        // Successful connection to the peer

        clientChannel.channel = new channel.Channel();

        clientChannel.channel.closeConnection = function tcpCloseConnection() {
            clientChannel.socket.end();
        };

        clientChannel.channel.flushOutput = function tcpFlushOutput(typedArray) {
            var buf = new Buffer(typedArray.buffer);
            clientChannel.socket.write(buf);
        };

        clientChannel.onconnect(null, clientChannel.channel);
    });

    clientChannel.socket.on('data', function(buffer) {
        clientChannel.channel.onData(buffer.buffer);
    });

    clientChannel.socket.on('end', function() {
        clientChannel.channel && clientChannel.channel.onClosed();
    });

    clientChannel.socket.on('error', function(error) {
        if (clientChannel.channel) {
            clientChannel.channel.onError(error);
        }
        else {
            clientChannel.onconnect(error, null);
        }
    });

    return clientChannel;
}

function createServerTCP(ps) {
    var host = ps.getprop('Host') || '0.0.0.0';
    var port = ps.getprop('Port');
    var def_port = false;

    if (!port) {
        port = 1534;
        def_port = true;
    }

    var serverChannel = {
        ps: ps,
        server: null,
        onconnection: null,
        channel: null
    };

    serverChannel.server = require('net').createServer(function(socket) {
        // A new connection

        serverChannel.channel = new channel.Channel();

        socket.on('close', function() {
            serverChannel.channel.onClosed();
        });

        socket.on('data', function(buffer) {
            serverChannel.channel.onData(buffer.buffer);
        });

        socket.on('error', function(error) {
            serverChannel.channel.onError(error);
        });

        serverChannel.channel.closeConnection = function tcpCloseConnection() {
            socket.end();
        };

        serverChannel.channel.flushOutput = function tcpFlushOutput(typedArray) {
            var buf = new Buffer(typedArray.buffer);
            socket.write(buf);
        };

        serverChannel.onconnection(serverChannel, serverChannel.channel);
    });

    serverChannel.server.on('error', function(error) {
        if (error.code == 'EADDRINUSE') {
            setTimeout(function() {
                serverChannel.server.close();
                serverChannel.server.listen(port, host, server_listening);
            }, 1000);
        }
    });

    serverChannel.server.on('close', function() {

    });

    serverChannel.server.listen(port, host, server_listening);

    function server_listening() {
        var address = serverChannel.server.address();
        console.log('opened server on %j', address);

        /* Get port property in case the default port could not be used or
         * the client specified a port that the system converts to a
         * dynamic port number. */

        ps.addprop('Port', address.port);
    }

    return serverChannel;
}
