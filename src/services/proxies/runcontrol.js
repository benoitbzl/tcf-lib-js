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
var schemas = require('../schemas.js')
var types = schemas.types;
var cmds = schemas.commands;

var suspended = { title: 'suspended', type: 'boolean' };
var PC = { title: 'PC', type: 'integer' };
var reason = { title: 'reason', type: 'string' };
var ctxDataList = { title: 'ctxDataList', type: 'array' };
var ctxList = { title: 'ctxList', type: 'array' };
var state_data = { title: 'state_data', type: 'object' };

module.exports = {
    name: "RunControl",
    cmds: [
        cmds.getContext,
        cmds.getChildren,
        // C • <token> • RunControl • getState • <string: context ID> •
        // R • <token> • <error report> • <boolean: suspended> •
        //    <int: PC> • <string: last state change reason> • <state data> •
        { name: "getState", args: [types.id], results: [types.err, suspended, PC, reason, types.odata] },
        // C • <token> • RunControl • resume • <string: context ID> • <int: mode> • <int: count> •
        // C • <token> • RunControl • resume • <string: context ID> • <int: mode> • <int: count> • <object: parameters> •
        // R • <token> • <error report> •
        { name: "resume", args: [types.id, types.integer, types.integer, { type: 'object', required: false }], results: [types.err] },
        // C • <token> • RunControl • suspend • <string: context ID> •
        // R • <token> • <error report> •
        { name: "suspend", args: [types.id], results: [types.err] },
        // C • <token> • RunControl • terminate • <string: context ID> •
        // R • <token> • <error report> •
        { name: "terminate", args: [types.id], results: [types.err] },
        // C • <token> • RunControl • detach • <string: context ID> •
        // R • <token> • <error report> •
        { name: "detach", args: [types.id], results: [types.err] },
    ],
    evs: [
        // E • RunControl • contextAdded • <array of context data> •
        { name: "contextAdded", args: [ctxDataList] },
        // E • RunControl • contextChanged • <array of context data> •
        { name: "contextChanged", args: [ctxDataList] },
        // E • RunControl • contextRemoved • <array of context IDs> •
        { name: "contextRemoved", args: [ctxList] },
        // E • RunControl • contextSuspended • <string: context ID> • <int: PC> •
        //     <string: reason> • <state data> •
        { name: "contextSuspended", args: [types.ctxID, PC, reason, state_data] },
        // E • RunControl • contextResumed • <string: context ID> •
        { name: "contextResumed", args: [types.ctxID] },
        // E • RunControl • contextException • <string: context ID> • <string: description> •
        { name: "contextException", args: [types.ctxID, { title: 'description', type: 'string' }] },
        // E • RunControl • containerSuspended • <string: context ID> • <int: PC> •
        //     <string: reason> • <state data> • <array of context IDs> •
        { name: "containerSuspended", args: [types.ctxID, PC, reason, state_data, ctxList] },
        // E • RunControl • containerResumed • <array of context IDs> •
        { name: "containerResumed", args: [ctxList] },
    ]
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
