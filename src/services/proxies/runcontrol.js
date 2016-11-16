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

module.exports = function RunControl(channel) {
    var c = channel;
    var svcName = "RunControl";
    var listeners = new utils.TcfListenerIf();
    var context = new utils.TcfContextIf(c, svcName);

    // E • RunControl • contextAdded • <array of context data> •
    c.addEventHandler(svcName, "contextAdded", ['ctxDataList'], listeners.notify);
    // E • RunControl • contextChanged • <array of context data> •
    c.addEventHandler(svcName, "contextChanged", ['ctxDataList'], listeners.notify);
    // E • RunControl • contextRemoved • <array of context IDs> •
    c.addEventHandler(svcName, "contextRemoved", ['ctxList'], listeners.notify);
    // E • RunControl • contextSuspended • <string: context ID> • <int: PC> •
    //     <string: reason> • <state data> •
    c.addEventHandler(svcName, "contextSuspended", ['ctxID', 'PC', 'reason', 'state_data'], listeners.notify);
    // E • RunControl • contextResumed • <string: context ID> •
    c.addEventHandler(svcName, "contextResumed", ['ctxID'], listeners.notify);
    // E • RunControl • contextException • <string: context ID> • <string: description> •
    c.addEventHandler(svcName, "contextException", ['ctxID', 'description'], listeners.notify);
    // E • RunControl • containerSuspended • <string: context ID> • <int: PC> •
    //     <string: reason> • <state data> • <array of context IDs> •
    c.addEventHandler(svcName, "containerSuspended", ['ctxID', 'PC', 'reason', 'state_data', 'ctxList'], listeners.notify);
    // E • RunControl • containerResumed • <array of context IDs> •
    c.addEventHandler(svcName, "containerResumed", ['ctxList'], listeners.notify);

    return {
        getState: function(ctxID, cb) {
            // C • <token> • RunControl • getState • <string: context ID> •
            // R • <token> • <error report> • <boolean: suspended> •
            //    <int: PC> • <string: last state change reason> • <state data> •
            return c.sendCommand(svcName, 'getState', [ctxID], ['err', 'suspended', 'PC', 'reason', 'data'], cb);
        },
        resume: function(ctxID, mode, count, cb, range) {
            // C • <token> • RunControl • resume • <string: context ID> • <int: mode> • <int: count> •
            // C • <token> • RunControl • resume • <string: context ID> • <int: mode> • <int: count> • <object: parameters> •
            // R • <token> • <error report> •
            if (typeof range != 'undefined')
                return c.sendCommand(svcName, 'resume', [ctxID, mode, count, range], ['err'], cb);
            else
                return c.sendCommand(svcName, 'resume', [ctxID, mode, count], ['err'], cb);
        },
        suspend: function(ctxID, cb) {
            // C • <token> • RunControl • suspend • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'suspend', [ctxID], ['err'], cb);
        },
        terminate: function(ctxID, cb) {
            // C • <token> • RunControl • terminate • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'terminate', [ctxID], ['err'], cb);
        },
        detach: function(ctxID, cb) {
            // C • <token> • RunControl • detach • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'detach', [ctxID], ['err'], cb);
        },
        addListener: listeners.add,
        removeListener: listeners.remove,
        getContext: context.getContext,
        getChildren: context.getChildren,
    };
};

module.exports.ResumeModes = {
    /* Context resume modes */
    RM_RESUME: 0,
    /* Resume normal execution of the context */
    RM_STEP_OVER: 1,
    /* Step over a single instruction */
    RM_STEP_INTO: 2,
    /* Step a single instruction */
    RM_STEP_OVER_LINE: 3,
    /* Step over a single source code line */
    RM_STEP_INTO_LINE: 4,
    /* Step a single source code line */
    RM_STEP_OUT: 5,
    /* Run until control returns from current function */
    RM_REVERSE_RESUME: 6,
    /* Start running backwards */
    RM_REVERSE_STEP_OVER: 7,
    /* Reverse of RM_STEP_OVER - run backwards over a single instruction */
    RM_REVERSE_STEP_INTO: 8,
    /* Reverse of RM_STEP_INTO: "un-execute" the previous instruction */
    RM_REVERSE_STEP_OVER_LINE: 9,
    /* Reverse of RM_STEP_OVER_LINE */
    RM_REVERSE_STEP_INTO_LINE: 10,
    /* Reverse of RM_STEP_INTO_LINE */
    RM_REVERSE_STEP_OUT: 11,
    /* Reverse of RM_STEP_OUT */
    RM_STEP_OVER_RANGE: 12,
    /* Step over instructions until PC is outside the specified range */
    RM_STEP_INTO_RANGE: 13,
    /* Step instruction until PC is outside the specified range for any reason */
    RM_REVERSE_STEP_OVER_RANGE: 14,
    /* Reverse of RM_STEP_OVER_RANGE */
    RM_REVERSE_STEP_INTO_RANGE: 15,
    /* Reverse of RM_STEP_INTO_RANGE */
    RM_UNTIL_ACTIVE: 16,
    /* Run until the context becomes active - scheduled to run on a target CPU */
    RM_REVERSE_UNTIL_ACTIVE: 17,
    /* Run reverse until the context becomes active */
    RM_TERMINATE: 19,
    /* Terminate the context */
    RM_DETACH: 18,
    /* Detach the context */
    RM_UNDEF: 19
};
