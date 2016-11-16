/**
 * Implementation of a TCF server 
 * @module tcf/server
 * @license
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


var utils = require("./utils.js");
var peer = require("./peer.js");
var channel = require("./channel.js");

var serverCount = 1;

function getServiceManagerId() {
    return utils.get_agent_id() + "-" + serverCount++;
}

/*
 * Start TCF channel server
 */
function channelServer(ps) {
    var transportname = ps.getprop("TransportName");

    if (!transportname) {
        transportname = "TCP";
        ps.addprop("TransportName", transportname);
    }

    var cs = null;

    var transport = channel.get_transport(transportname);
    if (transport) {
        cs = transport.create(ps);
    }

    return cs;
}

/**
 * Creates a new tcf server.
 * a tcf client is a channel and the corresponding set of tcf remote services 
 * proxies.
 * 
 * @class 
 * @param {PeerUrl} url - Defines the url of the server
 * @param {Protocol} protocol - definition of server side services 
 * @param {object} [options] - additionnal options
 */
function Server(url, protocol, options) {

    this.ps = peer.peer_from_url(url);

    this.ps.addprop("ServiceManagerID", getServiceManagerId());

    this.serv = channelServer(this.ps);

    if (!this.serv) {
        throw new Error("Error creating server channel");
    }

    this.serv.onconnection = function newConnection(serv, c) {
        c.setProtocol(protocol);
        c.start();
    };

}

module.exports = {
    Server: Server
};
