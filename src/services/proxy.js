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


function TcfListenerIf() {
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


module.exports = function  Proxy(svcInterface, c) {
    var self = this;

    /* create helper functions */
    svcInterface.cmds.forEach(cmd => {
        var fn = function (cmd) {
            /* transform parameter according to schema.
             * For now we only handle binary args */
            var args = cmd.args.map((arg, i) => {
                if (arg.type === 'binary') return btoa(arguments[i + 1]);
                else return arguments[i + 1];
            });
            return c.sendCommand(svcInterface.name, cmd.cmd || cmd.name, args)
                .then( args => {
                    /* transform parameter according to schema.
                     * For now we only handle binary args 
                     * We construct an object with the results (needed for compatibility */
                    var res = {};
                    cmd.results.forEach((result, i) => {
                       if (result.type === 'binary') res[result.title] = atob(args[i]);
                       else  res[result.title] = args[i];
                    });
                    return res;
                });
        }
        this[cmd.name] = fn.bind(self, cmd);    
    });

    var listeners = new TcfListenerIf();
    this.addListener = listeners.add;
    this.removeListener = listeners.remove;
    this.itf = svcInterface;

    /* if this service supports event create the event listener */
    svcInterface.evs.forEach( ev => {
        var argsName = ev.args.map( arg => {
            return arg.title;
        });
        // install handler on the channel
        c.addEventHandler(svcInterface.name, ev.name, listeners.notify.bind(this, argsName, ev.name));
     });
}

