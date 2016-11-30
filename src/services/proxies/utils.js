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

// TcfListenerIf : creates a listener object that is used to forward TCF events.

exports.TcfListenerIf = function TcfListenerIf() {
    var listeners = [];
    return {
        add: function(listener) {
            return listeners.push(listener);
        },
        remove: function(listener) {
            var idx;
            idx = listeners.indexOf(listener);
            if (idx >= 0) {
                return listeners.splice(idx, 1);
            }
        },
        notify: function(proto, evName, args) {
            var idx;
            var ev = {name : evName};
            args.forEach((arg, i) => {
                if (proto[i]) ev[proto[i]] = arg;
            })

            for (idx = 0; idx < listeners.length; idx++) {
                if (typeof listeners[idx][ev.name] != 'undefined')
                    listeners[idx][ev.name](ev);
            }
        }
    };
};

// TcfContextIf : creates a TCF Context related commands container used by many TCF services
exports.TcfContextIf = function TcfContextIf(c, svcName) {
    return {
        getChildren: function(ctxID, cb) {
            // C • <token> • RunControl • getChildren • <string: parent context ID> •
            // R • <token> • <error report> • <array of context IDs> •
            return c.sendCommand(svcName, 'getChildren', [ctxID], ['err', 'ctxIDs'], cb);
        },
        getContext: function(ctxID, cb) {
            // C • <token> • RunControl • getContext • <string: context ID> •
            // R • <token> • <error report> • <context data> •
            return c.sendCommand(svcName, 'getContext', [ctxID], ['err', 'data'], cb);
        }
    };
};
