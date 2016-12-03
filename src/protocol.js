/**
 * TCF Protocol interface 
 * @module tcf/protocol
 * @license
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
 * Protocol object holds the various command and events handlers implemented by 
 * the peer.
 * 
 * @class 
 */
var Protocol = function () {
    this._svc = {};
    this._ev = {};
    this._svcList = [];
};

/**
 * @typedef {function} CmdHandler
 * @param {Channel} c - channel requesting the command
 * @param {TcfArg_t[]}  args - array of command arguments
 * @returns {Promise|TcfArg_t[]} returns either a Promise that will be resolved 
 * to a list of respose arguments or the list of response arguments
 * @throws {ProtocolError} - if arguments fail to comply to service spec. 
 * Note that protocol errors leads to immediate termination of the channel
 */

/**
 * @typedef {function} EvHandler
 * @param {Channel} c - channel sending the event
 * @param {TcfArg_t[]}  args - array of event arguments
 */
 
/**
 * Add a command handler
 * @param {string} svc - name of the service
 * @param {string} cmd - command name
 * @param {CmdHandler} ch - callback for handling the command
 * @param {string[]}  [parsers = [...'json']] - list of command argument parsers
 * 
 */
Protocol.prototype.addCommandHandler = function(svc, cmd, ch, parsers) {
    if( !this._svc[svc] ) this._svc[svc] = {};
    this._svc[svc][cmd] = {ch: ch, parsers: parsers};
    this._svcList.push(svc);
};

/**
 * Add an event handler
 * @param {string} svc - name of the service
 * @param {string} ev - event name
 * @param {EvHandler} - callback for handling the event
 * @param {string[]}  [parsers = [...'json']] - list of event argument parsers
 */
Protocol.prototype.addEventHandler = function (svc, ev, eh, parsers) {
    if( !this._ev[svc] ) this._ev[svc] = {};
    this._svc[svc][ev] = {eh: eh, parsers: parsers};
};

Protocol.prototype.execCommandHandler = function (c, svc, cmd, args) {
    if (!this._svc[svc][cmd].ch) throw "Invalid command handler";
    var res = this._svc[svc][cmd].ch(c, args);
    if (res && res.then) return res;
    else return Promise.resolve(res);
};

Protocol.prototype.getCommandArgsParsers = function (svc, cmd) {
    return this._svc[svc][cmd].parsers || [];
};

Protocol.prototype.getServiceList = function () {
    return this._svcList;
};

exports.Protocol = Protocol;

