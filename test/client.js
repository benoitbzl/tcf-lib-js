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

/* global describe, before, it */

"use strict";

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var chaiAsPromised = require("chai-as-promised");
var fs = require('fs');

chai.should();
chai.use(chaiAsPromised);
var tcf = require('../src/tcf');

var DEBUG = true;                          // Set to true to enable debug log

describe('tcf-client', function () {
    var server, serverSec;
    var wsurl = 'WS::20001';
    var wssurl = 'WSS:localhost:20004';

    function log(msg) {
        if (DEBUG) console.log('LOG: ', msg);
    }

    before(function () {
        /** create a server with a Pong Command */
        var protocol = new tcf.Protocol();
        protocol.addCommandHandler('Pong', 'echo', function (c, args) {
            var msg = args[0];
            if (!msg) throw { msg: 'Invalid argument' };
            return ([0, msg]);
        });

        protocol.addCommandHandler('Pong', 'error', function (c, args) {
            if (!args) throw { msg: 'Invalid argument' };
            return ([{ error: "this is an error object" }]);
        });

        protocol.addCommandHandler('Pong', 'delay', function (c, args) {
            if (!args) throw { msg: 'Invalid argument' };
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([0]);
                }, +args);
            });
        });

        /* test service ping */
        server = new tcf.Server(wsurl, protocol);
        serverSec = new tcf.Server(wssurl, protocol, {
            cert: fs.readFileSync('test/certs/server-crt.pem'),
            key: fs.readFileSync('test/certs/server-key.pem'),
            ca: fs.readFileSync('test/certs/ca-crt.pem'),
            requestCert: true,
            rejectUnauthorized: true
        });
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
                () => { reject("channel Closed"); },
                () => { reject("channel Error"); }
            );
        })
    });

    it('Server Connection without server', function (done) {
        var client = new tcf.Client();

        client.connect('WS::20002',
            () => { done('channel connected'); },
            () => { done("channel Closed"); },
            () => { done(); }
        );
    });

    it('Should return -1 for invalid peer url', function () {
        var client = new tcf.Client();

        expect(client.connect()).to.equal(-1);

        return expect(client.connect('')).to.equal(-1);
    });

    it('Send command echo - should return 2 args', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();

            client.connect(wsurl,
                () => {
                    client.sendCommand('Pong', 'echo', ['testmsg'])
                        .then((res) => {
                            res.should.have.length(2);
                            res[0].should.equal(0);
                            res[1].should.equal('testmsg');
                            client.close();
                            resolve();
                        })
                        .catch(err => { reject(err) })
                },
                () => { reject("channel Closed"); },
                () => { reject("channel Error"); }
            );
        });
    });

    it('Send command error - should return 1 arg (error)', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();

            client.connect(wsurl,
                () => {
                    client.sendCommand('Pong', 'error', ['testmsg'])
                        .then((res) => {
                            res.should.have.length(1);
                            res[0].should.not.equal(0);
                            resolve();
                            client.close();
                        })
                        .catch(err => { reject(err) })
                },
                () => { reject("channel Closed"); },
                () => { reject("channel Error"); }
            );
        });
    });


    it('Close a connection with a pending command', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();

            client.connect(wsurl,
                () => {
                    client.sendCommand('Pong', 'delay', [2000])
                        .then((res) => {
                            reject();
                        })
                        .catch(err => {
                            resolve();
                        });

                    setTimeout(() => {
                        client.close();
                    }, 1000);

                },
                () => {},
                () => { reject("channel Error"); }
            );
        });
    });

    it('Define a client with a Pong service proxy interface', function () {
        return new Promise((resolve, reject) => {

            var itf = new tcf.Interface({
                name: 'Pong',
                cmds: [{
                    name: 'echo',
                    args: [{ type: 'string' }],
                    results: [{ title: 'err', type: 'number' }, { title: 'msg', type: 'string' }],
                }]
            });

            var client = new tcf.Client([itf]);

            client.connect(wsurl,
                () => {
                    client.svc['Pong'].echo('testmsg')
                        .then((res) => {
                            res.should.have.all.keys(['err', 'msg']);
                            res.err.should.equal(0);
                            res.msg.should.equal('testmsg');
                            resolve();
                            client.close();
                        })
                        .catch(err => { reject(err) });
                },
                () => { reject("channel Closed"); },
                () => { reject("channel Error"); }
            );
        });
    });

    it('should trigger the channelConnected event', function () {
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            server.on("channelConnected", (c) => { resolve() });
            client.connect(wsurl,
                () => {
                    client.close();
                },
                () => { reject("channel Closed"); },
                () => { reject("channel Error"); }
            );

        });
    });

    it('should receive client parameters', function () {
        var path = "/test?arg1=test1";
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            server.on("channelConnected", (c) => {
                c.should.have.property('connectionParams');
                expect(c.connectionParams).to.have.property('arg1');
                c.connectionParams['_url'].should.equal(path);
                c.connectionParams.arg1.should.equal('test1');
                c.close();
                resolve();
            });
            client.connect(wsurl + path,
                () => {
                    client.close();
                },
                () => { },
                () => { reject("channel Error"); }
            );
        });
    });

    it('should fail connection to a wss server', function () {
        var path = "/test?arg1=test1";
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            client.connect(wssurl,
                () => {
                    reject("connection was made with incorrect certificates");
                },
                () => { resolve(); },
                () => { resolve(); }
            );
        });
    });

    it('should  connect to a wss server', function () {
        var path = "/test?arg1=test1";
        return new Promise((resolve, reject) => {
            var client = new tcf.Client();
            client.connect(wssurl, {
                key: fs.readFileSync('test/certs/client1-key.pem'),
                cert: fs.readFileSync('test/certs/client1-crt.pem'),
                ca: fs.readFileSync('test/certs/ca-crt.pem')
            },
                () => {
                    resolve();
                },
                () => { reject("connection error"); },
                () => { reject("connection closed"); }
            );
        });
    });

});
