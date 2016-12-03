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

var signals = { title: 'signals', type: 'array' };
var env = { title: 'env', type: 'array' };
var dont_stop = { title: 'dont_stop', type: 'boolean' };
var dont_pass = { title: 'dont_pass', type: 'boolean' };
var pending = { title: 'pending', type: 'boolean' };

module.exports = {
    name: "ProcessesV1",
    cmds: [
        cmds.getContext,
        { name: "getChildren", args: [types.ctxID, types.boolean], results: [types.err, types.ctxIDs] },
        // C • <token> • Processes • attach • <string: context ID> •
        // R • <token> • <error report> •
        { name: "attach", args: [types.ctxID], results: [types.err] },
        // C • <token> • Processes • detach • <string: context ID> •
        // R • <token> • <error report> •
        { name: "detach", args: [types.ctxID], results: [types.err] },
        // C • <token> • Processes • terminate • <string: context ID> •
        // R • <token> • <error report> •
        { name: "terminate", args: [types.ctxID], results: [types.err] },
        // C • <token> • Processes • getSignalList • <string: context ID> •
        // R • <token> • <error report> • <array of signal descriptions> •
        { name: "getSignalList", args: [types.ctxID], results: [types.err, signals] },
        // C • <token> • Processes • getSignalMask • <string: context ID> •
        // R • <token> • <error report> • <int: don't stop bitset> • <int: don't pass bitset> • <int: pending bitset> •
        { name: "getSignalMask", args: [types.ctxID], results: [types.err, dont_stop, dont_pass, pending] },
        // C • <token> • Processes • setSignalMask • <string: context ID> • <int: don't stop bitset> • <int: don't pass bitset> •
        // R • <token> • <error report> •
        { name: "setSignalMask", args: [types.ctxID, dont_stop, dont_pass], results: [types.err] },
        // C • <token> • Processes • signal • <string: context ID> • <int: signal> •
        // R • <token> • <error report> •
        { name: "signal", args: [types.ctxID, types.integer], results: [types.err] },
        // C • <token> • Processes • getEnvironment •
        // R • <token> • <error report> • <string array: environment variables> •
        { name: "getEnvironment", args: [], results: [types.err, env] },
        // C • <token> • Processes • start • <string: working directory> • <string: program image file> •
        //     <string array: command line> • <string array: environment variables> • <boolean: attach> •
        // R • <token> • <error report> • <context data> •
        { name: "start", args: [types.string, types.string, types.string, types.string, types.boolean], results: [types.err, types.odata] },
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
        { name: "startv1", cmd: "start", args: [types.string, types.string, types.string, types.string, types.object], results: [types.err, types.odata] },
        // C • <token> • Processes • setWinSize •  <string: context ID> • <int: columns> • <int: raws> •
        // R • <token> • <error report> •
        { name: "setWinSize", args: [types.ctxID, types.integer, types.integer], results: [types.err] },

    ],
    evs: [
        // E • Processes • exited • <string: process ID> • <int: exit code> •
        { name: "exited", args: [{ title: 'procID', type: 'string' }, { title: 'exit_code', type: 'integer' }]}
    ]
};
