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
 * Basic tests for node-tcf-client
 */

"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var tcf = require('../src/tcf');

var DEBUG = true;                          // Set to true to enable debug log
var DONT_REMOVE_DOCKER_CONTAINER = false;   // Set to true to not remove container and allow post debugging


describe('tcf-client', function () {
    var tcf_agent = null;
    var tcf_log_file = __dirname + '/../tmp/tcf-agent.log';
    var server;
    var wsurl = 'WS::20001';

    function log(msg) {
        if (DEBUG) console.log('LOG: ', msg);
    }

    before(function(){
        /** create a server with a Pong Command */
        var protocol = new tcf.Protocol();
        protocol.addCommandHandler('Pong','echo', function (c, args) {
            var msg = args[0];
            if (!msg) throw {msg:'Invalid argument'};
            return ([0,msg]);
        });

        protocol.addCommandHandler('Pong','error', function (c, args) {
            if (!args) throw {msg:'Invalid argument'};
            return ([{error:"this is an error object"}]);
        });

        /* test service ping */
        server = new tcf.Server(wsurl, protocol);
    });

    it('Server Connection', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            client.connect(wsurl,
                () => {
                    expect(client).to.have.property('svc');
                    client.close();
                    resolve();
                },
                () => {reject("channel Closed");},
                () => {reject("channel Error");}
            );
        })
    });

    it('Server Connection without server', function (done) {
        var client = new tcf.Client();

        client.connect('WS::20002',
            () => {done('channel connected');},
            () => {done("channel Closed");},
            () => {done();}
        );
    });

    it('Should return -1 for invalid peer url', function () {
        var client = new tcf.Client();

        expect(client.connect()).to.equal(-1);

        return expect(client.connect('')).to.equal(-1);
    });

    it('Send command echo - should return 2 args', function () {
        return new Promise ((resolve, reject) => {
            var client = new tcf.Client();

            client.connect(wsurl,
                () => {
                    client.sendCommand('Pong', 'echo',['testmsg'])
                    .then((res) => {
                        res.should.have.length(2);
                        res[0].should.equal(0);
                        res[1].should.equal('testmsg');
                        resolve();
                        client.close();
                    })
                    .catch(err => {reject(err)})
                },
                () => {reject("channel Closed");},
                () => {reject("channel Error");}
                );
        });
    });

    it('Send command error - should return 1 arg (error)', function () {
        return new Promise ((resolve, reject) => {
            var client = new tcf.Client();

            client.connect(wsurl,
                () => {
                    client.sendCommand('Pong', 'error',['testmsg'])
                    .then((res) => {
                        res.should.have.length(1);
                        res[0].should.not.equal(0);
                        resolve();
                        client.close();
                    })
                    .catch(err => {reject(err)})
                },
                () => {reject("channel Closed");},
                () => {reject("channel Error");}
                );
        });
    });
});
