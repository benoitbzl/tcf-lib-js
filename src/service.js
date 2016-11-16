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
/**
 *  service.js - construct a tcf service object 
 */

/* global exports */

/**
 * Broacast 
 * 
 * Holds the list of channels for events notifications.
 */
var Broadcast = function() {
    this.bcg = [];
    return this;
};

Broadcast.prototype.addChannel = function(c) {
    if (!this.bcg.find(function(channel) {
            if (!channel) return false;
            return channel.id === c.id;
        })) this.bcg.push(c);
};

Broadcast.prototype.removeChannel = function(c) {
    var i = this.bcg.findIndex(function(channel) {
        return channel.id === c.id;
    });
    if (i >= 0) this.bcg.splice(i, 1);
};

/**
 * Service
 * 
 * Service object that holds the various service command handlers
 */
var Service = function(svc, _bcg) {
    this.bcg = _bcg ? _bcg : new Broadcast();
    this.proto = {};
    this.name = svc;
};

Service.prototype.sendEvent = function(ev, arg) {
    var i;
    for (i = 0; i < this.broadcast.length; i++) {
        this.broadcast[i].sendEvent(this.name, ev, arg);
    }
};

Service.prototype.addCommand = function(cmd, ch, argsSchema, resSchema) {
    if (this.proto.cmd) throw 'command already defined';
    this.proto[cmd] = {
        handler: ch,
        argsSchema: argsSchema,
        resSchema: resSchema
    }
};

Service.prototype.getArgsSchemas = function (cmd) {
    return this.proto[cmd].argSchema;
}

Service.prototype.getResSchemas = function (cmd) {
    return this.proto[cmd].resSchema;
}

/**
 * Execute a command of the service
 * 
 * cmd : command string 
 */
Service.prototype.exec = function (cmd, args) {
    return this.proto[cmd].handler.call(args);
};

exports.Broadcast = Broadcast;
exports.Service = Service;
