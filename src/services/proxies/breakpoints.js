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

module.exports = function Breakpoints(channel) {
    var c = channel;
    var svcName = "Breakpoints";
    var listeners = new utils.TcfListenerIf();

    c.addEventHandler(svcName, "status", ['bpID', 'bp_status'], listeners.notify);
    c.addEventHandler(svcName, "contextAdded", ['bpIDList'], listeners.notify);
    c.addEventHandler(svcName, "contextChanged", ['bpIDList'], listeners.notify);
    c.addEventHandler(svcName, "contextRemoved", ['bpIDList'], listeners.notify);

    return {
        addListener: listeners.add,
        removeListener: listeners.remove,
        // C • <token> • Breakpoints • set • <array of breakpoints> •
        // R • <token> • <error report> •
        set: function(bpList, cb) {
            return c.sendCommand(svcName, 'set', [bpList], ['err'], cb);
        },
        // C • <token> • Breakpoints • add • <breakpoint data> •
        // R • <token> • <error report> •
        add: function(bpData, cb) {
            return c.sendCommand(svcName, 'add', [bpData], ['err'], cb);
        },
        // C • <token> • Breakpoints • change • <breakpoint data> •
        // R • <token> • <error report> •
        change: function(bpData, cb) {
            return c.sendCommand(svcName, 'change', [bpData], ['err'], cb);
        },
        // C • <token> • Breakpoints • enable • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        enable: function(bpIDList, cb) {
            return c.sendCommand(svcName, 'enable', [bpIDList], ['err'], cb);
        },
        // C • <token> • Breakpoints • disable • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        disable: function(bpIDList, cb) {
            return c.sendCommand(svcName, 'disable', [bpIDList], ['err'], cb);
        },
        // C • <token> • Breakpoints • remove • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        remove: function(bpIDList, cb) {
            return c.sendCommand(svcName, 'remove', [bpIDList], ['err'], cb);
        },
        // C • <token> • Breakpoints • getIDs •
        // R • <token> • <error report> • <array of breakpoint IDs> •
        getIds: function(cb) {
            return c.sendCommand(svcName, 'getIDs', [], ['err', 'bpIDList'], cb);
        },
        // C • <token> • Breakpoints • getProperties • <string: breakpoint ID> •
        // R • <token> • <error report> • <breakpoint data> •
        getProperties: function(bpID, cb) {
            return c.sendCommand(svcName, 'getProperties', [bpID], ['err', 'bpData'], cb);
        },
        // C • <token> • Breakpoints • getStatus • <string: breakpoint ID> •
        // R • <token> • <error report> • <breakpoint status> •
        getStatus: function(bpID, cb) {
            return c.sendCommand(svcName, 'getStatus', [bpID], ['err', 'bp_status'], cb);
        },
        // C • <token> • Breakpoints • getCapabilities • <string: context ID> •
        // R • <token> • <error report> • <service capabilities> •
        getCapabilities: function(ctxID, cb) {
            return c.sendCommand(svcName, 'getStatus', [ctxID], ['err', 'bp_caps'], cb);
        }
    };
};
