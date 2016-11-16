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

module.exports = function Expressions(channel) {
    var c = channel;
    var svcName = "Expressions";
    var context = new utils.TcfContextIf(c, svcName);

    return {
        getContext: context.getContext,
        getChildren: context.getChildren,
        create: function(ctxID, lang, script, cb) {
            c.sendCommand(svcName, 'create', [ctxID, lang, script], ['err', 'expr_ctx'], cb);
        },
        createInScope: function(scope, script, cb) {
            c.sendCommand(svcName, 'createInScope', [scope, script], ['err', 'expr_ctx'], cb);
        },
        evaluate: function(expr_id, cb) {
            c.sendCommand(svcName, 'evaluate', [expr_id], ['value', 'err', 'info'], cb, [], [0]);
        },
        assign: function(value, expr_id, cb) {
            c.sendCommand(svcName, 'assign', [expr_id, value], ['err'], cb, [1]);
        },
        dispose: function(expr_id, cb) {
            c.sendCommand(svcName, 'dispose', [expr_id], ['err'], cb);
        },
    };
};
