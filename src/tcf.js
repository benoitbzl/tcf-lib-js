/**
 * Top level TCF library module
 * @module tcf
 * @license
 * Copyright (c) 2016 Wind River Systems.
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

/**
 * @typedef {boolean|number|string|Object|Uint8Array} TcfArg_t - Defines the
 * different types of arguments for TCF commands, Events, or Response handling
 */

/**
 * @typedef {string} PeerUrl - string representing a peer url.
 * @example "WS::8080" server running on localhost on port 8080 (all interfaces)
 * @example "TCP::9000" server running on localhost on port 900 (all interfaces)
 * @example "WSS:192.168.1.1:443"
 * @example "wss://192.168.1.1/"
 */

/* global exports */

require('./transports.js');

module.exports = function(options) {

    require('./options').set(options);

    return  {
        Client: require('./client.js').Client,
        Service: require('./service.js').Service,
        Protocol: require('./protocol.js').Protocol,
        schemas: require('./schemas.js').schemas,
        BroadcastGroup: require('./broadcast.js').BroadcastGroup,
        Server: require('./server.js').Server
    };
};

// create the default method members with no options applied for backwards compatibility

module.exports.Client = require('./client.js').Client;
module.exports.Service = require('./service.js').Service;
module.exports.Protocol = require('./protocol.js').Protocol;
module.exports.schemas = require('./schemas.js').schemas;
module.exports.BroadcastGroup = require('./broadcast.js').BroadcastGroup;
module.exports.Server = require('./server.js').Server;
