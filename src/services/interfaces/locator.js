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

var attrsList = {title: 'attrsList', type:'array'};
var agentID = {title: 'agentID', type:'string'};

module.exports = {
    name: "Locator",
    cmds: [
        {name: "sync", args:[], results: []},
        {name: "redirect", args:[types.peer], results: [types.err]},
        // C • <token> • Locator • getPeers •
        // R • <token> • <error report> • <array of peer attributes> •
        {name: "getPeers", args:[], results: [types.err, attrsList]},
        // C • <token> • Locator • getAgentID •
        // R • <token> • <error report> • <string: agentID> •
        {name: "getAgentID", args:[], results: [types.err, agentID]},
    ],
    evs: []
};
