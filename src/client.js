/**
 * TCF Client interface 
 * @module tcf/client
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

/* global exports Promise console Uint8Array */

var channel = require('./channel.js');
var peer = require('./peer.js');
var proto = require('./protocol.js');

//===============================================================================
// TCF services proxy definitions

var service_proxies = require('./services/proxies.js');
var prototypes = require('./services/schemas_svc.js').services;
var utils = require('./services/proxies/utils.js');

function Proxy(prototype, c) {
    var self = this;

    /* create helper functions */
    prototype.cmds.forEach(cmd => {
        var fn = function (cmd) {
            /* transform parameter according to schema.
             * For now we only handle binary args */
            var args = cmd.args.map((arg, i) => {
                if (arg.type === 'binary') return btoa(arguments[i + 1]);
                else return arguments[i + 1];
            });
            return c.sendCommand(prototype.name, cmd.cmd || cmd.name, args)
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

    var listeners = new utils.TcfListenerIf();
    this.addListener = listeners.add;
    this.removeListener = listeners.remove;

    /* if this service supports event create the event listener */
    prototype.evs.forEach( ev => {
        var argsName = ev.args.map( arg => {
            return arg.title;
        });
        // install handler on the channel
        c.addEventHandler(prototype.name, ev.name, listeners.notify.bind(this, argsName, ev.name));
     });
}

/**
 * Creates a new tcf client.
 * a tcf client is a channel and the corresponding set of tcf remote services 
 * proxies.
 * 
 * @class 
 * @param {Protocol} protocol - definition of client side services 
 */
exports.Client = function Client(protocol) {
    var self = this;

    /**
     * remote service proxies hashtable. This property 
     * is populated with the proxies for the corresponding remote peer services once the channel is connected
     * @type {object} 
     */
    this.svc = {};
    this.attrs = undefined;
    this.queryAttrs = false;
    // Private variables

    var c;
    var prot = protocol || new proto.Protocol();

    /**
     * Establishes the connection to the peer
     * @param {PeerUrl} url - string defining a peer url 
     * @param {object|null} - Option object or null
     * @param {function} - callback upon successfull connection
     * @param {function} - callback upon communication error 
     * @param {function} - callback upon close 
     */
    this.connect = function connect(url, options, onconnect, onclose, onerror) {
        if (arguments.length > 1 && typeof options === "function") {
            onerror = onclose;
            onclose = onconnect;
            onconnect = options;
            options = undefined;
        }

        var ps = peer.peer_from_url(url);

        try {
            var cc = channelClient(ps, options);
        }
        catch (error) {

        }

        if (!cc) {
            return -1;
        }

        cc.onconnect = function clientOnconnect(error, chan) {
            if (error) {
                // Unable to connect to server
                return onerror && onerror(error);
            }

            c = chan;

            // intercept the connection handler to initialize the services proxies.
            c.addHandler(channel.ChannelEvent.onclose, function () {
                // clear the proxies
                self.svc = {};
                if (onclose) setTimeout(onclose);
            });

            c.addHandler(channel.ChannelEvent.onerror, function (err) {
                if (onerror) onerror(err);
            });

            c.addHandler(channel.ChannelEvent.onconnect, function () {
                var idx;
                // initialize services proxies
                var svcs = c.getPeerServices();

                for (idx = 0; idx < svcs.length; idx++) {

                    if (svcs[idx] == "ZeroCopy") {
                        continue;
                    }
                    if (service_proxies[svcs[idx]]) {
                        self.svc[svcs[idx]] = new service_proxies[svcs[idx]](c);
                    }
                    else if (prototypes[svcs[idx]]) {
                        self.svc[svcs[idx]] = new Proxy(prototypes[svcs[idx]], c);
                    }
                    else {
                        //console.log("WARNING: ignore unknown service " + svcs[idx]);
                    }
                }

                // Store all services in the channel too
                c.svc = self.svc;

                if (self.queryAttrs) {
                    // Get the agent ID and peer attributes before configuring the profiler
                    self.svc.Locator.getAgentID(function (res) {
                        var agentID = res.agentID;
                        self.svc.Locator.getPeers(function (res) {
                            if (res.attrsList && agentID) {
                                for (var i = 0; i < res.attrsList.length; i++) {
                                    var attrs = res.attrsList[i];
                                    if (agentID == attrs.AgentID) {
                                        self.attrs = attrs;
                                    }
                                }
                            }

                            if (onconnect) setTimeout(onconnect);
                        });
                    });
                }
                else if (onconnect) {
                    setTimeout(onconnect);
                }
            });

            c.setProtocol(prot);

            // Start TCF protocol negociation

            c.start();

        };

        return 0;
    };

    /**
     * Controls zerocopy behaviour
     * @param {boolean} enable - requested state
     */
    this.enableZeroCopy = function (enable) {
        return c && c.enableZeroCopy(enable);
    };

    /**
     * Closes the client communication channel
     */
    this.close = function () {
        if (c && c.getState() != channel.ChannelState.Disconnected) {
            c.close();
        }
    };

    /**
     * retreive the channel object associated with the Client
     * @return {channel}
     */
    this.getChannel = function () {
        return c;
    };


    /**
     * sends a TCF command over the client's channel
     * @param {string} service - TCF service name
     * @param {string} method - TCF service method name
     * @param {TcfArg_t[]}  args - list of command arguments
     * @param {string[]}  [parsers = [...'json']] - list of response arguments parsers
     * @returns {promise<va_args>} promise will be rejected upon communication error 
     * and fullfilled when the command response is received. Note that if the 
     * response contains a TCF error report, the promise is still fulfilled.
     */
    this.sendCommand = function (args) {
        return c && c.sendCommand.apply(self, arguments);
    };

    /**
     * sends a TCF event over the client's channel. The "E" message is sent 
     * immediatly.
     * @param {string} service - TCF service name
     * @param {string} event - TCF service event name
     * @param {TcfArg_t[]}  [args] - list of event arguments
     * 
     */
    this.sendEvent = function (args) {
        return c && c.sendEvent.apply(self, arguments);
    };

};


/*
 * Start TCF channel server
 */
function channelClient(ps, options) {
    var transportname = ps.getprop("TransportName");

    if (!transportname) {
        transportname = "TCP";
        ps.addprop("TransportName", transportname);
    }

    var cc = null;

    var transport = channel.get_transport(transportname);
    if (transport) {
        cc = transport.connect(ps, options);
    }

    return cc;
}
