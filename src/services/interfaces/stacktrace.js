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

var frameIDs = {type: 'array'};
var frames = {title: 'frames', type: 'array'};

module.exports = {
    name: "StackTrace",
    cmds: [
        // C • <token> • StackTrace • getContext • <array of context IDs> •
        // R • <token> • <array of context data> • <error report> •
        {name: "getContext", args:[frameIDs], results: [frames, types.err]},
        cmds.getChildren,
        {name: "getChildrenRange", args:[types.ctxID, types.integer, types.integer], results: [types.err, types.ctxIDs]},
    ],
    evs: []
};
