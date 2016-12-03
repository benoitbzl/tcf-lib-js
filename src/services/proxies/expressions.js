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
var cmds =  schemas.commands;

var expr_ctx = {title: "expr_ctx", type:'string'};

module.exports = {
    name: "Expressions",
    cmds: [
        cmds.getContext,
        cmds.getChildren,
        {name: "create", args:[types.ctxID, types.string, types.string], results: [types.err, expr_ctx]},
        {name: "createInScope", args:[types.string, types.string], results: [types.err, expr_ctx]},
        {name: "evaluate", args:[types.string], results: [types.data, types.err, types.info]},
        {name: "assign", args:[types.string, types.string], results: [types.err]},
        {name: "dispose", args:[types.string], results: [types.err]},        
    ],
    evs: []
};
