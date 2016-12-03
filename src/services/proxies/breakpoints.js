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
var scs = schemas.types;

var bpID = {title: "bpID", type:'string'};
var bpList = {title: "bpList", type:'array'};
var bpData = {title: "bpData", type:'object'};
var bpIDList = {title: "bpIDList", type:'array'};
var bpStatus = {title: "bpStatus", type:'object'};
var bpCaps = {title: "bpCaps", type:'object'};

module.exports = {
    name: "Breakpoints",
    cmds: [
        // C • <token> • Breakpoints • set • <array of breakpoints> •
        // R • <token> • <error report> •
        {name: "set", args:[bpList], results: [scs.err]},
        // C • <token> • Breakpoints • add • <breakpoint data> •
        // R • <token> • <error report> •
        {name: "add", args:[bpData], results: [scs.err]},
        // C • <token> • Breakpoints • change • <breakpoint data> •
        // R • <token> • <error report> •
        {name: "change", args:[bpData], results: [scs.err]},
        // C • <token> • Breakpoints • enable • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        {name: "enable", args:[bpIDList], results: [scs.err]},
        // C • <token> • Breakpoints • disable • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        {name: "disable", args:[bpIDList], results: [scs.err]},
        // C • <token> • Breakpoints • remove • <array of breakpoint IDs> •
        // R • <token> • <error report> •
        {name: "remove", args:[bpIDList], results: [scs.err]},
        // C • <token> • Breakpoints • getIDs •
        // R • <token> • <error report> • <array of breakpoint IDs> •
        {name: "getIds", args:[], results: [scs.err, bpIDList]},
        // C • <token> • Breakpoints • getProperties • <string: breakpoint ID> •
        // R • <token> • <error report> • <breakpoint data> •
        {name: "getProperties", args:[bpID], results: [scs.err, bpData]},
        // C • <token> • Breakpoints • getStatus • <string: breakpoint ID> •
        // R • <token> • <error report> • <breakpoint status> •
        {name: "getStatus", args:[bpID], results: [scs.err, bpStatus]},
        // C • <token> • Breakpoints • getCapabilities • <string: context ID> •
        // R • <token> • <error report> • <service capabilities> •
        {name: "getCapabilities", args:[scs.ctxID], results: [scs.err, bpCaps]}
    ],
    evs: [
        {name: "status", args: [bpID, bpStatus] },
        {name: "contextAdded", args: [bpIDList] },
        {name: "contextChanged", args: [bpIDList] },
        {name: "contextRemoved", args: [bpIDList] },
    ]
}
