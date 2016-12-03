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
var cmds = schemas.commands;

module.exports = {
    name: "Terminals",
    cmds: [
        cmds.getContext,
        // C • <token> • Terminals • launch • <string: pty type> • <string: encoding> •
        //     <string array: environment variables> •
        // R • <token> • <error report> • <context data> •
        {name: "launch", args:[scs.string, scs.string, scs.string], results: [scs.err, scs.ctxData]},
        // C • <token> • Terminals • exit • <string: context ID> •
        // R • <token> • <error report> •
        {name: "exit", args:[scs.ctxID], results: [scs.err]},
        // C • <token> • Terminals • setWinSize • <string: context ID> • <integer: newWidth> • <integer: newHeight> •
        // R • <token> • <error report> •
        {name: "setWinSize", args:[scs.ctxID, scs.integer, scs.integer], results: [scs.err]},
    ],
    evs: [
        // E • Terminals • exited • <string: terminal ID> • <int: exit code> •
        {name: "exited", args: [scs.ID, {title : 'exit_code', type: 'integer'}] },
        // E • Terminals • winSizeChanged • <string: terminal ID> • <int: newWidth> • <int: newHeight> •
        {name: "winSizeChanged", args: [scs.ID, {title : 'width', type: 'integer'}, {title : 'height', type: 'integer'}] }        
    ] 
}
