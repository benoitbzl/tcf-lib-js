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
var utils = require('./utils.js');

module.exports = function Symbols(channel) {
    var c = channel;
    var svcName = "Symbols";
    var context = new utils.TcfContextIf(c, svcName);

    var symbols_cache = {};
    var listenersSet = false;

    var symbols_cache_flush = function(ev) {
        for (var symbol in symbols_cache) {
            var idx;
            if (ev.ctxID) {
                if (symbols_cache[symbol].data.OwnerID == ev.ctxID)
                    delete(symbols_cache[symbol]);
            }
            else if (ev.ctxList) {
                for (idx = 0; idx < ev.ctxList.length; idx++) {
                    if (symbols_cache[symbol].data.OwnerID == ev.ctxList[idx]) {
                        delete(symbols_cache[symbol]);
                        break;
                    }
                }
            }
            else if (ev.ctxDataList) {
                for (idx = 0; idx < ev.ctxDataList.length; idx++) {
                    if (symbols_cache[symbol].data.OwnerID == ev.ctxDataList[idx].ID) {
                        delete(symbols_cache[symbol]);
                        break;
                    }
                }
            }
        }
    };

    var rclisteners = {
        contextAdded: symbols_cache_flush,
        contextRemoved: symbols_cache_flush,
        contextChanged: symbols_cache_flush
    };

    c.addEventHandler("MemoryMap", "changed", ['ctxID'], symbols_cache_flush);

    return {
        getContext: function(ctxID, cb) {
            if (!listenersSet) {
                c.svc.RunControl.addListener(rclisteners);
                listenersSet = true;
            }

            if (symbols_cache[ctxID]) {
                if (cb) cb(symbols_cache[ctxID]);
                return Promise.resolve(symbols_cache[ctxID]);
            }

            // jshint -W098
            return new Promise(function(resolve) {
                c.sendCommand(svcName, 'getContext', [ctxID], ['err', 'data'])
                    .then(function(res) {
                        if (res.data && res.data.UpdatePolicy === exports.Symbols.UpdatePolicy.UpdateOnMemoryMapChanges) {
                            symbols_cache[ctxID] = res;
                        }
                        resolve(res);
                        if (cb) cb(res);
                    });
            });
        },
        getChildren: context.getChildren,
        find: function(ctxID, name, cb) { // TODO handle variable args and results
            return c.sendCommand(svcName, 'find', [ctxID, name], ['err', 'symIDs'], cb);
        },
        findByName: function(ctxID, name, cb) {
            return c.sendCommand(svcName, 'findByName', [ctxID, name], ['err', 'symIDs'], cb);
        },
        findByAddr: function(ctxID, addr, cb) {
            return c.sendCommand(svcName, 'findByAddr', [ctxID, addr], ['err', 'symIDs'], cb);
        },
        findInScope: function(frameID, ip, scopeID, sym_name, cb) {
            return c.sendCommand(svcName, 'findInScope', [frameID, ip, scopeID, sym_name], ['err', 'symIDs'], cb);
        },
        list: function(ctxID, cb) {
            return c.sendCommand(svcName, 'list', [ctxID], ['err', 'symIDs'], cb);
        },
        getArrayType: function(symID, length, cb) {
            return c.sendCommand(svcName, 'getArrayType', [symID, length], ['err', 'symID'], cb);
        },
        getLocationInfo: function(symID, cb) { // TODO check weird return args if info == NULL
            return c.sendCommand(svcName, 'getLocationInfo', [symID], ['err', 'info'], cb);
        },
        findFrameInfo: function(ctxID, addr, cb) {
            return c.sendCommand(svcName, 'findFrameInfo', [ctxID, addr], ['err', 'addr', 'size', 'commands', 'info'], cb);
        },
        getSymFileInfo: function(ctxID, addr, cb) {
            return c.sendCommand(svcName, 'getSymFileInfo', [ctxID, addr], ['err', 'region'], cb);
        },
        getAddressInfo: function(ctxID, addr, cb) {
            return c.sendCommand(svcName, 'getAddressInfo', [ctxID, addr], ['err', 'info'], cb);
        }
    };
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
