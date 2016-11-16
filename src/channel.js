/**
 * TCF Channel inteface 
 * @module tcf/channel
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

if (typeof global !== 'undefined') {
    if (typeof global.atob === 'undefined') global.atob = require('atob');
    if (typeof global.btoa == 'undefined') global.btoa = require('btoa');
}

var promise = Promise;
var utils = require('./utils.js');
var JSONbig = require('json-bigint');

var channelId = 0;

var ChannelState = {
    Connected: 0,
    Disconnected: 1,
    StartWait: 2,
    Started: 3,
    HelloSent: 4,
    HelloReceived: 5,
    RedirectSent: 6,
    RedirectReceived: 7
};

exports.ChannelState = ChannelState;

var ChannelEvent = {
    onconnect: 0,
    onclose: 1,
    onerror: -1
};

exports.ChannelEvent = ChannelEvent;

var TcfError = {
    ERR_PROTOCOL: 1
};

var ESC = 3;
var MARKER_EOM = -1;
var MARKER_EOS = -2;
var OBUF_SIZE = 1024 * 128;

/**
 * @class 
 * @param {Protocol} protocol - definition of local services 
 */
function Channel(protocol) {
    var ibuf;
    var iread = 0;
    var obuf = new Uint8Array(OBUF_SIZE);
    var owrite = 0;
    var state = ChannelState.StartWait;
    var listeners = [];
    var messageCount = 0;
    var replyHandlers = [];
    var eventHandlers = [];
    var peerServices = [];
    var tokenId = 1;
    var log = false;
    var proto;
    var svcList;
    var hasZeroCopySupport = false;

    setProtocol(protocol);

    var enableZeroCopy = function(enable) {
        hasZeroCopySupport = enable;
    };

    var sendEvent = function(service, name, args) {
        writeStringz("E");
        writeStringz(service);
        writeStringz(name);
        writeStringz(JSONbig.stringify(args));
        writeStream(MARKER_EOM);
    };

    var sendCommand = function(service, name, args, resParsers) {
        var pres =  new promise(function(resolve, reject) {
            var rh = {};
            var i;
            var ibin_arg;
            tokenId++;
            writeStringz("C");
            writeStringz(JSONbig.stringify(tokenId));
            writeStringz(service);
            writeStringz(name);
            for (i = 0; i < args.length; i++) {
                /* test binary type */
                if (args[i].buffer && args[i].buffer instanceof ArrayBuffer) {
                    writeStringz(JSONbig.stringify(btoa(args[i])));
                }
                else writeStringz(JSONbig.stringify(args[i]));
            }
            writeStream(MARKER_EOM);
            rh.tokenId = tokenId;
            rh.resolve = resolve;
            rh.reject = reject;
            rh.progress = null;
            rh.resParsers = resParsers;
            rh.service = service;
            rh.name = name;
            replyHandlers.push(rh);
            if (log) console.log(tokenId, service, name, args);
        });
        return pres;
    };
    
    var writeStream = function(ch) {
        utils.assert(owrite < obuf.length);
        if (ch == MARKER_EOM) {
            obuf[owrite++] = ESC;
            obuf[owrite++] = 1;
            flushOutput();
        }
        else if (ch == MARKER_EOS) {
            obuf[owrite++] = ESC;
            obuf[owrite++] = 2;
            flushOutput();
        }
        else obuf[owrite++] = ch;
        return 0;
    };

    var writeStringz = function(str) {
        var i;
        for (i = 0; i < str.length; i++) {
            writeStream(str.charCodeAt(i));
        }
        writeStream(0);
        return 0;
    };

    // jshint -W098
    // eslint-disable-next-line no-unused-vars
    var writeBinaryDataz = function writeBinaryDataz(buffer) {
        var i;
        if (!hasZeroCopySupport || buffer.length === 0) {
            return writeStringz(JSONbig.stringify(btoa(buffer)));
        }
        var str = buffer.toString();
        writeStream('('.charCodeAt());
        var buf_size = str.length.toString();
        for (i = 0; i < buf_size.length; i++) {
            writeStream(buf_size.charCodeAt(i));
        }
        writeStream(')'.charCodeAt());
        if (str.length > 32) {
            writeStream(3);
            writeStream(3);
            var n = str.length;
            while (true) { // eslint-disable-line no-constant-condition
                if (n <= 0x7f) {
                    writeStream(n);
                    break;
                }
                writeStream((n & 0x7f) | 0x80);
                n >>= 7;
            }
            for (i = 0; i < str.length; i++) {
                writeStream(str.charCodeAt(i));
            }
        }
        else {
            for (i = 0; i < str.length; i++) {
                writeStream(str.charCodeAt(i));
                if (str.charCodeAt(i) == 3) writeStream(0);
            }
        }
        writeStream(0);
        return 0;
    };

    var peekStream = function peekStream() {
        var ch;
        utils.assert(iread < ibuf.length);
        if ((ch = ibuf[iread]) == ESC) {
            utils.assert(iread < ibuf.length - 1);
            ch = ibuf[iread + 1];
            switch (ch) {
                case 0:
                    return ESC;
                case 1:
                    return MARKER_EOM;
                case 2:
                    return MARKER_EOS;
                case 3:
                    throw "ZeroCopy not implemented";
                default:
                    utils.assert(0);
            }
        }
        return ch;
    };

    var readStream = function readStream() {
        var ch;
        utils.assert(iread < ibuf.length);
        // check for escape character
        if ((ch = ibuf[iread++]) == ESC) {
            utils.assert(iread < ibuf.length);
            ch = ibuf[iread++];
            switch (ch) {
                case 0:
                    return ESC;
                case 1:
                    {
                        messageCount--;
                        return MARKER_EOM;
                    }
                case 2:
                    return MARKER_EOS;
                case 3:
                    throw "ZeroCopy not implemented";
                default:
                    utils.assert(0);
            }
        }
        return ch;
    };

    var readStringz = function readStringz() {
        var ch;
        var str = "";
        // returns a string from the ibuf
        while ((ch = ibuf[iread++]) !== 0) {
            utils.assert(iread < ibuf.length);
            str += String.fromCharCode(ch);
        }
        return str;
    };

    var notifyChannelEvent = function notifyChannelEvent(ev, data) {
        var i;
        var handlers = listeners[ev];

        if (handlers) {
            for (i = 0; i < handlers.length; i++) {
                if (handlers[i]) handlers[i](data);
            }
        }
    };

    var eventLocatorHello = function eventLocatorHello() {
        var i;
        peerServices = JSONbig.parse(readStringz());
        for (i = 0; hasZeroCopySupport && i < peerServices.length; i++) {
            if (peerServices[i] == "ZeroCopy") {
                hasZeroCopySupport = true;
                break;
            }
        }
        if (i == peerServices) hasZeroCopySupport = false;
        var eom = readStream();
        utils.assert(eom == MARKER_EOM);
        if (state == ChannelState.Started) {
            state = ChannelState.HelloReceived;
        }
        else {
            state = ChannelState.Connected;
            notifyChannelEvent(ChannelEvent.onconnect);
        }
    };

    var skipUntilEOM = function skipUntilEOM() {
        var ch;
        do {
            ch = readStream();
        } while (ch != MARKER_EOM);
    };

    var handleProtocolMessage = function handleProtocolMessage() {
        var msg = {},
            arg,
            ch,
            // eslint-disable-next-line no-unused-vars
            error;

        utils.assert(messageCount > 0);
        msg.type = readStringz();

        if (msg.type.length < 1) {
            error = TcfError.ERR_PROTOCOL;
        }
        else if (msg.type == "C") {
            var token = readStringz();
            var svc = readStringz();
            var name = readStringz();
            var args = [];
            var cargsParsers = proto.getCommandArgsParsers(svc, name);

            /* parse arguments */
            while ((ch = peekStream()) != MARKER_EOM) {
                if (cargsParsers[res_idx] === 'binary') {
                    args.push(atob(JSONbig.parse(readStringz())));
                }
                else args.push(JSONbig.parse(readStringz()));
            }

            readStream(); //flush EOM

            proto.execCommandHandler(channel, svc, name, args)
            .then(function(res) {
                writeStringz("R");
                writeStringz(token);
                res.forEach(function(rarg) {
                    writeStringz(JSONbig.stringify(rarg));
                });
                writeStream(MARKER_EOM);
            })
            .catch(function(err) {
                // close the channel 
                console.log ('TCF protocol Error', err);
            });
        }
        else if ((msg.type == "R") || (msg.type == "P") || (msg.type == "N")) {
            var rargs = [];
            msg.token = readStringz();
            // get the reply handler
            var rh = popReplyHandler(msg.token);
            msg.res = {};
            var res_idx = 0;
            // build the result object
            while ((ch = peekStream()) != MARKER_EOM) {
                if (ch === 0) {
                    rargs.push(null);
                    readStream();
                }
                else {
                    arg = readStringz();
                    if (arg === "null")
                        rargs.push(null);
                    else {
                        if (rh.parsers && rh.parsers[res_idx] && rh.parsers[res_idx] === 'binary') {
                            rargs.push(atob(JSONbig.parse(arg)));
                        }
                        else rargs.push(JSONbig.parse(arg));
                    }
                }
                res_idx++;
            }
            // skip EOM
            readStream();
            rh.resolve(rargs);
        }
        else if (msg.type == "E") {
            msg.service = readStringz();
            msg.name = readStringz();
            if ((state == ChannelState.Started || state == ChannelState.HelloSent) &&
                (msg.service == "Locator" && msg.name == "Hello")) {
                eventLocatorHello();
            }
            else {
                var eargsParsers = proto.getEventArgsParsers(msg.service, msg.name);
                var eargs = [];
                var ev_idx = 0;
                
                while (peekStream() != MARKER_EOM) {
                    if (eargsParsers[ev_idx] === 'binary') {
                        eargs.push(atob(JSONbig.parse(readStringz())));
                    }
                    else eargs.push(JSONbig.parse(readStringz()));
                    ev_idx++;
                }
                skipUntilEOM();

                proto.execEventHandler(channel, svc, name, eargs)
                .catch(function(err) {
                    //close the channel immediatly
                    console.log ('TCF protocol Error', err);
                });
            }
        }
        else {
            error = TcfError.ERR_PROTOCOL;
            if (log) console.error("Invalid TCF message" + msg.type);
        }
        if (log) console.log(JSONbig.stringify(msg));
    };

    var updateMessageCount = function updateMessageCount(buf) {
        var i;
        for (i = 0; i < buf.byteLength; i++) {
            switch (buf[i]) {
                case 1: //EOM
                    setTimeout(handleProtocolMessage, 0);
                    messageCount++;
                    break;
                case 2: //EOS
                    break;
            }
        }
    };

    var sendHelloMessage = function sendHelloMessage() {
        utils.assert(state == ChannelState.Started || state == ChannelState.HelloReceived);
        writeStringz("E");
        writeStringz("Locator");
        writeStringz("Hello");
        writeStringz(JSONbig.stringify(svcList));
        writeStream(MARKER_EOM);
        if (state == ChannelState.Started) {
            state = ChannelState.HelloSent;
        }
        else {
            state = ChannelState.Connected;
            notifyChannelEvent(ChannelEvent.onconnect);
        }
    };

    function flushOutput() {
        channel.flushOutput(obuf.slice(0, owrite));
        owrite = 0;
    }

    var popReplyHandler = function findReplyHandler(token) {
        var i;
        for (i = 0; i < replyHandlers.length; i++) {
            if (replyHandlers[i].tokenId == token)
                return replyHandlers.splice(i, 1)[0];
        }
        return null;
    };

    var findEventHandler = function findEventHandler(service, name) {
        var i;
        for (i = 0; i < eventHandlers.length; i++) {
            if ((eventHandlers[i].service == service) &&
                (eventHandlers[i].name == name))
                return eventHandlers[i];
        }
        return undefined;
    };

    function onData(typedArray) {

        if (!ibuf) {
            ibuf = new Uint8Array(typedArray);
            updateMessageCount(ibuf);
        }
        else {
            var size = 0;
            var remains = 0;
            if (iread < ibuf.length) {
                remains = ibuf.subarray(iread);
                size = remains.length;
            }
            var msgbuf = new Uint8Array(typedArray);
            updateMessageCount(msgbuf);
            ibuf = new Uint8Array(msgbuf.length + size);
            if (size > 0) ibuf.set(remains);
            ibuf.set(msgbuf, size);
            iread = 0;
            msgbuf = null;
        }
    }

    var sendCommandMarshal = function sendCommandMarshal(service, name, args_list, res_list, done, ibin_args, ibin_res) {
        var rh = {};
        var i;
        var ibin_arg;
        tokenId++;
        writeStringz("C");
        writeStringz(JSONbig.stringify(tokenId));
        writeStringz(service);
        writeStringz(name);
        for (i = 0; i < args_list.length; i++) {
            ibin_arg = false;
            for (var j = 0; ibin_args && j < ibin_args.length; j++) {
                if (ibin_args[j] == i) {
                    ibin_arg = true;
                    break;
                }
            }
            if (ibin_arg) {
                writeStringz(JSONbig.stringify(btoa(args_list[i])));
            }
            else writeStringz(JSONbig.stringify(args_list[i]));
        }
        writeStream(MARKER_EOM);
        rh.tokenId = tokenId;
        rh.reply = done;
        rh.progress = null;
        rh.marshall = true;
        rh.res_list = res_list;
        rh.ibin_res = ibin_res;
        rh.service = service;
        rh.name = name;
        replyHandlers.push(rh);
        if (log) console.log(tokenId, service, name, args_list);
        return 0;
    };

    function onClosed() {
        state = ChannelState.Disconnected;
        notifyChannelEvent(ChannelEvent.onclose);
    }

    function onError(err) {
        state = ChannelState.Disconnected;
        notifyChannelEvent(ChannelEvent.onerror, err);
    }

    function setProtocol(protocol) {
        utils.assert(state == ChannelState.StartWait || state == ChannelState.Disconnected);
        proto = protocol || {};
        svcList = protocol ? proto.getServiceList() : [];
    }

    var channel = {
        id: channelId++,

        setProtocol: setProtocol,

        start: function channel_start() {
            utils.assert(state == ChannelState.StartWait);
            state = ChannelState.Started;
            if (log) console.log("channel server connecting");
            sendHelloMessage();
        },

        onData: onData,         // Call by the transport layer
        onClosed: onClosed,     // Call by the transport layer
        onError: onError,       // Call by the transport layer

        flushOutput: null,      // set by the transport layer
        closeConnection: null,  // set by the transport layer

        close: function() {
            if (state === ChannelState.Disconnected) return;

            writeStream(MARKER_EOS);
            writeStream(0);
            writeStream(MARKER_EOM);

            state = ChannelState.Disconnected;

            this.closeConnection();
        },

        addHandler: function(ev, cb) {
            if (typeof listeners[ev] == "undefined") listeners[ev] = [];
            listeners[ev].push(cb);
        },
        sendCommand: sendCommand,
        sendEvent: sendEvent,
        enableZeroCopy: enableZeroCopy,
        getPeerServices: function() {
            return peerServices;
        },
        addEventHandler: function(service, name, res_list, eh) {
            utils.assert(!findEventHandler(service, name));
            utils.assert(res_list);
            eventHandlers.push({
                service: service,
                name: name,
                res_list: res_list,
                handler: eh
            });
        },
        getState: function() {
            return state;
        }
    };

    return channel;
}

exports.Channel = Channel;

var channel_transports = {};

function add_transport(transport) {
    channel_transports[transport.name.toUpperCase()] = transport;
}

function get_transport(name) {
    return channel_transports[name.toUpperCase()];
}

exports.add_transport = add_transport;
exports.get_transport = get_transport;
