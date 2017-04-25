/**
 * Copyright (c) 2017 Wind River Systems
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
 * Basic tests for node-tcf-client
 */

/* global describe, before, it, after */

"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var tcf = require('../src/tcf');
var itf = require('../src/services/interfaces').services;

var DEBUG = true;                          // Set to true to enable debug log

describe('tcf-proxy', function () {
    var wsurl = 'WS::20002';
    var server;

    function log(msg) {
        if (DEBUG) console.log('LOG: ', msg);
    }

    before(function(){
        /** create a server with a Pong Command */
        var protocol = new tcf.Protocol();
        protocol.addCommandHandler('Terminals','test', function (c, args) {
            return ([]);
        });
       
        /* test service ping */
        server = new tcf.Server(wsurl, protocol);
    });
    
    after(function(){
        server = undefined;
    });
    it('check Proxy itf for Terminals', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            client.connect(wsurl, 
                () => {
                    expect(client).to.have.property('svc');
                    expect(client.svc).to.have.property('Terminals');
                    expect(client.svc.Terminals.itf).to.equal(itf.Terminals);
                    client.close(); 
                    resolve();
                },
                () => {reject("channel Closed");},
                () => {reject("channel Error");}
            );
        })
    });
});
