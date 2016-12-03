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

var types = {
        string: { type: 'string' },
        object: { type: 'object' },
        boolean: { type: 'boolean' },
        integer: { type: 'integer' },
        data: { title: 'data', type: 'binary' },
        odata: { title: 'data', type: 'object' },
        info: { title: 'info', type: 'string' },
        ctxID: { title: 'ctxID', type: 'string' },
        ctxIDs: { title: 'ctxIDs', type: 'array' },
        ctx: { title: 'data', type: 'object' },
        err: { title: 'err', type: 'object' },
        ctxData: { title: 'data', type: 'object' },
        ID: { title: 'ID', type: 'string' },
        id: { title: 'id', type: 'string' },
        streamID: {title: 'streamID', type: 'string'},
        peer: {title: 'peer', type: 'string'}
    };

module.exports = {
    types: types,
    commands: {
        getContext: { name: "getContext", args: [types.ctxID], results: [types.err, types.ctx] },
        getChildren: { name: "getChildren", args: [types.ctxID], results: [types.err, types.ctxIDs] },
    }
}
