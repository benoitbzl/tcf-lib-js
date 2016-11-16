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

module.exports = function Terminals(channel) {
    var c = channel;
    var svcName = "Terminals";
    var listeners = new utils.TcfListenerIf();
    var context = new utils.TcfContextIf(c, svcName);

    // E • Terminals • exited • <string: terminal ID> • <int: exit code> •
    c.addEventHandler(svcName, "exited", ['ID', 'exit_code'], listeners.notify);
    // E • Terminals • winSizeChanged • <string: terminal ID> • <int: newWidth> • <int: newHeight> •
    c.addEventHandler(svcName, "winSizeChanged", ['ID', 'width', 'height'], listeners.notify);

    return {
        addListener: listeners.add,
        removeListener: listeners.remove,
        getContext: context.getContext,
        launch: function(ptyType, encoding, env, cb) {
            // C • <token> • Terminals • launch • <string: pty type> • <string: encoding> •
            //     <string array: environment variables> •
            // R • <token> • <error report> • <context data> •
            return c.sendCommand(svcName, 'launch', [ptyType, encoding, env], ['err', 'data'], cb);
        },
        exit: function(ctxID, cb) {
            // C • <token> • Terminals • exit • <string: context ID> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'exit', [ctxID], ['err'], cb);
        },
        setWinSize: function(ctxID, width, height, cb) {
            // C • <token> • Terminals • setWinSize • <string: context ID> • <integer: newWidth> • <integer: newHeight> •
            // R • <token> • <error report> •
            return c.sendCommand(svcName, 'setWinSize', [ctxID, width, height], ['err'], cb);
        }
    };
};
