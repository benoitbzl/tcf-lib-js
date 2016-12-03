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

module.exports = {
    name: "Streams",
    cmds: [
        {name: "subscribe", args:[scs.string], results: [scs.err]},
        {name: "unsubscribe", args:[scs.string], results: [scs.err]},
        {name: "read", args:[scs.streamID, scs.integer], results: [scs.data, scs.err, {title: "lost", type:"integer"}, {title:'eos', type:"boolean"}]},
        {name: "write", args:[scs.streamID, scs.integer, scs.data], results: [scs.err]},
        {name: "eos", args:[scs.streamID], results: [scs.err]},
        {name: "connect", args:[scs.streamID], results: [scs.err]},
        {name: "disconnect", args:[scs.streamID], results: [scs.err]},
    ],
    evs: [
        // E • Streams • created • <string: type> • <string: stream ID> • <string: context ID> •
        {name: "created", args: [{title : 'type', type: 'string'}, scs.streamID, scs.ctxID] },
        // E • Streams • disposed • <string: type> • <string: stream ID> • 
        {name: "disposed", args: [{title : 'type', type: 'string'}, scs.streamID] }
    ]
}
