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
var utils = require('./utils.js');

module.exports = function Streams(channel) {
    var c = channel;
    var svcName = "Streams";
    var listeners = new utils.TcfListenerIf();

    c.addEventHandler(svcName, "created", listeners.notify.bind(this, ['type', 'streamID', 'ctxID'], "created"));
    c.addEventHandler(svcName, "disposed", listeners.notify.bind(this, ['type', 'streamID'], "disposed"));

    return {
        addListener: listeners.add,
        removeListener: listeners.remove,
        subscribe: function(type) {
            return c.sendCommand(svcName, 'subscribe', [type])
            .then( args => {
                return {err: args[0]};
            });
        },
        unsubscribe: function(type) {
            return c.sendCommand(svcName, 'unsubscribe', [type])
            .then( args => {
                return {err: args[0]};
            });
        },
        read: function(streamID, len) {
            return c.sendCommand(svcName, 'read', [streamID, len])
            .then( args => {
                return {
                    data: atob(args[0]),
                    err: args[1],
                    lost: args[2],
                    eos: args[3]};
            });
        },
        write: function(streamID, len, data) {
            return c.sendCommand(svcName, 'write', [streamID, len, btoa(data)])
            .then( args => {
                return {err: args[0]};
            });
        },
        eos: function(streamID) {
            return c.sendCommand(svcName, 'eos', [streamID])
            .then( args => {
                return {err: args[0]};
            });
        },
        connect: function(streamID) {
            return c.sendCommand(svcName, 'connect', [streamID])
            .then( args => {
                return {err: args[0]};
            });
        },
        disconnect: function(streamID) {
            return c.sendCommand(svcName, 'disconnect', [streamID])
            .then( args => {
                return {err: args[0]};
            });
        }
    };
};
