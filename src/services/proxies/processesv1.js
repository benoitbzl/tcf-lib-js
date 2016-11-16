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

module.exports = function ProcessesV1(channel) {
    var c = channel;
    var svcName = "ProcessesV1";
    var listeners = new utils.TcfListenerIf();
    var context = new utils.TcfContextIf(c, svcName);

    // E • Processes • exited • <string: process ID> • <int: exit code> •
    c.addEventHandler(svcName, "exited", ['procID', 'exit_code'], listeners.notify);

    return {
        addListener: listeners.add,
        removeListener: listeners.remove,
        getContext: context.getContext,
        getChildren: function(ctxID, isAttached, cb) {
            // C • <token> • Processes • getChildren •  <string: parent context ID> • <boolean: attached only> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'getChildren', [ctxID, isAttached], ['err', 'ctxIDs'], cb);
        },
        attach: function(ctxID, cb) {
            // C • <token> • Processes • attach • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'attach', [ctxID], ['err'], cb);
        },
        detach: function(ctxID, cb) {
            // C • <token> • Processes • detach • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'detach', [ctxID], ['err'], cb);
        },
        terminate: function(ctxID, cb) {
            // C • <token> • Processes • terminate • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'terminate', [ctxID], ['err'], cb);
        },
        getSignalList: function(ctxID, cb) {
            // C • <token> • Processes • getSignalList • <string: context ID> •
            // R • <token> • <error report> • <array of signal descriptions> •
            return c.sendCommand(svcName, 'getSignalList', [ctxID], ['err', 'signals'], cb);
        },
        getSignalMask: function(ctxID, cb) {
            // C • <token> • Processes • getSignalMask • <string: context ID> •
            // R • <token> • <error report> • <int: don't stop bitset> • <int: don't pass bitset> • <int: pending bitset> •
            return c.sendCommand(svcName, 'getSignalMask', [ctxID], ['err', 'dont_stop', 'dont_pass', 'pending'], cb);
        },
        setSignalMask: function(ctxID, dont_stop, dont_pass, cb) {
            // C • <token> • Processes • setSignalMask • <string: context ID> • <int: don't stop bitset> • <int: don't pass bitset> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'setSignalMask', [ctxID, dont_stop, dont_pass], ['err'], cb);
        },
        signal: function(ctxID, signal, cb) {
            // C • <token> • Processes • signal • <string: context ID> • <int: signal> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'signal', [ctxID, signal], ['err'], cb);
        },
        getEnvironment: function(cb) {
            // C • <token> • Processes • getEnvironment •
            // R • <token> • <error report> • <string array: environment variables> •
            return c.sendCommand(svcName, 'getEnvironment', [], ['err', 'env'], cb);
        },
        start: function(wd, img, args, env, attach, cb) {
            // C • <token> • Processes • start • <string: working directory> • <string: program image file> •
            //     <string array: command line> • <string array: environment variables> • <boolean: attach> •
            // R • <token> • <error report> • <context data> •
            return c.sendCommand(svcName, 'start', [wd, img, args, env, attach], ['err', 'data'], cb);
        },
        startv1: function(wd, img, args, env, opt, cb) {
            // C • <token> • Processes • start • <string: working directory> • <string: program image file> •
            //     <string array: command line> • <string array: environment variables> • <object: options> •
            // R • <token> • <error report> • <context data> •
            // options supported :
            //         Attach: boolean
            //  AttachChildren: boolean
            //  StopAtEntry: boolean
            //  StopAtMain: boolean
            //  UseTerminal: boolean
            //  SigDontStop: regsig
            //  SigDontPass: regsig
            return c.sendCommand(svcName, 'start', [wd, img, args, env, opt], ['err', 'data'], cb);
        },
        setWinSize: function(ctxID, columns, rows, cb) {
            // C • <token> • Processes • setWinSize •  <string: context ID> • <int: columns> • <int: raws> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'setWinSize', [ctxID, columns, rows], ['err'], cb);
        }
    };
};
