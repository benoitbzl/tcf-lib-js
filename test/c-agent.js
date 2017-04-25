/**
 * Copyright (c) 2017 Benoit Perrin
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
 * Basic tests for node-tcf-client against the opensource agent
 */

/* global describe, before, it */

"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);
var tcf = require('../src/tcf');

var peer = process.env['TCF_AGENT_PEER'] || 'TCP::1534';

(new tcf.Client()).connectDefered(peer)
    .then(client => {
        tests();
    })
    .catch(error => {
        tests(error);
    })

function tests(error) {

    describe('JS client with C agent ' + peer, function () {
        var client = null;

        before(function () {
            if (error) {
                console.warn('Skip C agent tests: cannot connect agent to ' + peer);
                this.skip();
            }
        });

        beforeEach(function(done) {
            client = new tcf.Client();
            client.connectDefered(peer)
                .then(client => {
                    return done();
                })
                .catch(error => {
                    client = null;
                    return done(error);
                })
        });

        afterEach(function(done) {
            if (client) {
                client.on('closed', () => {
                    if (client) {
                        client = null;
                        return done();
                    };
                });
                client.on('error', (error) => {
                    client = null;
                    return done(error);
                });

                client && client.close();
            }
            else {
                done();
            }
        });

        it('Send Locator.getAgentID command', function (done) {
            client.svc['Locator'].getAgentID()
                .then(res => {
                    if (res.err) return done(res.err.Format);
                    return done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('Send erroneous Locator.getAgentID command', function (done) {

            client.on('closed', function() {
                client = null;
                done();
            });

            client.sendCommand('Locator', 'getAgentID', ['dummy'])
                .then((res) => {
                    return done('Connection should have been closed by the agent');
                })
                .catch(error => {
                });
        });


        // it('Send command echo - should return 2 args', function () {

        //     return new Promise((resolve, reject) => {
        //         var client = new tcf.Client();

        //         client.connect(wsurl,
        //             () => {
        //                 client.sendCommand('Pong', 'echo', ['testmsg'])
        //                     .then((res) => {
        //                         res.should.have.length(2);
        //                         res[0].should.equal(0);
        //                         res[1].should.equal('testmsg');
        //                         client.close();
        //                         resolve();
        //                     })
        //                     .catch(err => { reject(err) })
        //             },
        //             () => { reject("channel Closed"); },
        //             () => { reject("channel Error"); }
        //         );
        //     });
        // });

    });
}
