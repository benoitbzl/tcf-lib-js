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

module.exports = function Memory(channel) {
    var c = channel;
    var svcName = "Memory";
    return {
        getContext: function(id, cb) {
            return c.sendCommand(svcName, 'getContext', [id], ['err', 'data'], cb);
        },
        getChildren: function(id, cb) {
            return c.sendCommand(svcName, 'getChildren', [id], ['err', 'ids'], cb);
        },
        get: function(id, address, word_size, byte_count, mode, cb) {
            return c.sendCommand(svcName, 'get', [id, address, word_size, byte_count, mode], ['data', 'err', 'bad_addresses'], cb, [], [0]);
        },
        set: function(id, address, word_size, byte_count, mode, data, cb) {
            return c.sendCommand(svcName, 'set', [id, address, word_size, byte_count, mode, data], ['err', 'bad_addresses'], cb, [5]);
        },
        fill: function(id, address, word_size, byte_count, mode, data, cb) {
            return c.sendCommand(svcName, 'fill', [id, address, word_size, byte_count, mode, data], ['err', 'bad_addresses'], cb);
        },
    };
};

module.exports.Modes = {
    /* Memory Access (read/write) modes */
    MM_CONTINUE_ON_ERROR: 1,
    /*  continue on error */
    MM_VERIFY: 2 /*  verify data */
};
