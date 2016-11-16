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

var utils = require("./utils.js");

var DEFAULT_SERVER_NAME = "TCF Agent";

function PeerServer(peerURL) {
    this.ID = null;
    this.peerURL = peerURL.slice(0);    // copy
    this.url = null;
    this.props = {};

    var data = peerURL.split(';');
    var peer = data[0];

    var peerAddr = peer.split(':');

    if (peerAddr.length < 2) throw new Error("Invalid peer URL");

    this.props.TransportName = peerAddr[0];

    if (peerAddr[1].startsWith("//")) {
        // The peer URL is already formed as a URL
        this.url = peerURL;
        this.props.Host = peerAddr[1].slice(2);
    }
    else {
        this.props.Host = peerAddr[1];
        // The WebSocket transport layer will create the 'url' property
        // if not defined.
    }

    this.props.Port = peerAddr[2];

    /* Add extra configuration key/value pairs */

    data.slice(1).forEach(function(extra) {
        var idx = extra.indexOf('=');
        if (idx != -1) {
            var key = extra.slice(0, idx);
            var value = extra.slice(idx + 1);
            this.addprop(key, value);
        }
        else {
            throw new Error("Invalid peer URL");
        }
    }, this);

}

PeerServer.prototype.addprop = function addprop(name, value) {
    if (name == "ID") {
        return this.ID = value;
    }

    this.props[name] = value;
};

PeerServer.prototype.getprop = function getprop(name, defaultValue) {
    if (name == "ID") {
        return this.ID || defaultValue;
    }

    return this.props[name] || defaultValue;
};

function peer_from_url(url) {
    if (!url) throw new Error('Invalid peer url');

    var ps = new PeerServer(url);

    ps.addprop("Name", DEFAULT_SERVER_NAME);
    ps.addprop("AgentID", utils.get_agent_id());

    return ps;
}


// Convert a TCF URL : (TCP|WS[S]):<host>([:<port>]|[<uri>]) to a WS[S] url
// The TCF WS URL is of the form: wss://<host>([:<port>/tcf]|[<uri>])
var peerFromUrl = function peerFromUrl(url) {
    var pcol;
    var items = [];
    var peer = {};

    if (!url || url === '') throw new Error('Invalid peer url');
    if (url.indexOf("ws://", 0) === 0 || url.indexOf("wss://", 0) === 0) {
        // url is already an TCF WS URL.
        peer.url = url;
        return peer;
    }
    items = url.split(":");
    peer.prot = items[0];
    peer.hostname = items[1];
    peer.port = items[2];
    if (url.substring(0, 3) === "TCP") peer.url = url;
    else {
        if (url.substring(0, 3) === "WSS") pcol = "wss://";
        else if (url.substring(0, 3) === "WS:") pcol = "ws://";
        else return null;
        peer.url = pcol + peer.hostname;
        if (peer.port) {
            peer.url += ":" + peer.port + "/tcf";
        }
    }
    /* + "/xxx" bit is for IE10 workaround */
    return peer;
};

module.exports = {
    peer_from_url: peer_from_url
};