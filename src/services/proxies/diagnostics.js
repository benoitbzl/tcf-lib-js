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
var utils = require('../../utils.js');

module.exports = function Diagnostics(channel) {
    var c = channel;
    var svcName = "Diagnostics";

    return {
        echo: function(str, cb) {
            return c.sendCommand(svcName, 'echo', [str], ['str'], cb);
        },
        echoFp: function(double, cb) {
            return c.sendCommand(svcName, 'echoFP', [double], ['double'], cb);
        },
        // jshint -W098
        // eslint-disable-next-line no-unused-vars
        echoErr: function(cb) {
            utils.assert(true, "echo_err not implemented"); // TODO need to handle multiple 0 returned
        },
        getTestList: function(cb) {
            return c.sendCommand(svcName, 'getTestList', [], ['err', 'list'], cb);
        },
        runTest: function(test_name, cb) {
            return c.sendCommand(svcName, 'runTest', [test_name], ['err', 'ctxID'], cb);
        },
        cancelTest: function(test_name, cb) {
            return c.sendCommand(svcName, 'cancelTest', [test_name], ['err'], cb);
        },
        getSymbol: function(ctxID, sym_name, cb) {
            return c.sendCommand(svcName, 'getSymbol', [ctxID, sym_name], ['err', 'symbol'], cb);
        },
        createTestStreams: function(size0, size1, cb) {
            return c.sendCommand(svcName, 'createTestStreams', [size0, size1], ['err', 'strID0', 'strID1'], cb);
        },
        disposeTestStream: function(strID, cb) {
            return c.sendCommand(svcName, 'disposeTestStream', [strID], ['err'], cb);
        }
    };
};
