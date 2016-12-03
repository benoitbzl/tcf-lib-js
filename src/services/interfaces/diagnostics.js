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
var double = {title: "double", type:'number'};
var list = {title: "list", type:'array'};
var symbol = {title: "symbol", type:'string'};

module.exports = {
    name: "Diagnostics",
    cmds: [
        {name: "echo", args:[scs.string], results: [scs.string]},
        {name: "echoFp", args:[double], results: [double]},
        {name: "echoErr", args:[], results: [scs.err]},
        {name: "getTestList", args:[], results: [scs.err, list]},
        {name: "runTest", args:[scs.string], results: [scs.err, scs.ctxID]},
        {name: "cancelTest", args:[scs.string], results: [scs.err]},
        {name: "getSymbol", args:[scs.ctxID, scs.string], results: [scs.err, symbol]},
        {name: "createTestStreams", args:[scs.integer, scs.integer], results: [scs.err, scs.string, scs.string]},
        {name: "disposeTestStream", args:[scs.string], results: [scs.err]}
    ],
    evs: []
};
