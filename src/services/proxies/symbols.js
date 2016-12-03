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

var symIDs = {title: 'symIDs', type: 'array'};
var symID = {title: 'symID', type: 'string'};
var info = {title: 'info', type: 'object'};
var commands = {title:'commands', type:'array'};
var size = {title: 'size', type: 'integer'};
var addr = {title: 'addr', type: 'integer'};
var region = {title: 'region', type: 'object'};

module.exports = {
    name: "Symbols",
    cmds: [
        cmds.getContext,
        cmds.getChildren,
        {name: "find", args:[types.ctxID, types.string], results: [types.err, symIDs]},
        {name: "findByName", args:[types.ctxID, types.string], results: [types.err, symIDs]},
        {name: "findByAddr", args:[types.ctxID, types.integer], results: [types.err, symIDs]},
        //findInScope: frameID, ip, scopeID, sym_name,
        {name: "findInScope", args:[types.string, types.integer, types.string, types.string], results: [types.err, symIDs]},
        {name: "list", args:[types.ctxID], results: [types.err, symIDs]},
        {name: "getArrayType", args:[symID, types.integer], results: [types.err, symID]},
        {name: "getLocationInfo", args:[symID], results: [types.err, info]},
        {name: "findFrameInfo", args:[types.ctxID, types.integer], results: [types.err, addr, size, commands, info]},
        {name: "getSymFileInfo", args:[types.ctxID, addr], results: [types.err, region]},
        {name: "getAddressInfo", args:[types.ctxID, addr], results: [types.err, info]},        
    ],
    evs: []
};

module.exports.UpdatePolicy = {
    UpdateOnMemoryMapChanges: 0, // Update on memory map changes
    UpdateOnExeStateChanges: 1 // Update symbol on exe state changes
};

module.exports.TypeClass = {
    unknown: 0, // Unknown type class.
    cardinal: 1, // Unsigned integer.
    integer: 2, // Signed integer.
    real: 3, // Float, double
    pointer: 4, // Pointer to anything
    array: 5, // Array of anything
    composite: 6, // Struct, union, or class
    enumeration: 7, // Enumeration type
    func: 8, // Function type
    member_ptr: 9, // A pointer on member type
    complex: 10 // complex float (since TCF 1.3)
};

module.exports.SymbolClass = {
    unknown: 0, // Unknown symbol class
    value: 1, // Constant value
    reference: 2, // Variable data object
    func: 3, // Function body
    type: 4, // A type
    comp_unit: 5, // A compilation unit
    block: 6, // A block of code.
    namespace: 7, // A namespace
    variant_part: 8, // A variant part of a structure (since TCF 1.3)
    variant: 9 // A member of a variant part of a structure (since TCF 1.3)
};
