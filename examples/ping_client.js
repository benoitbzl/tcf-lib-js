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
 
var tcf = require('../src/tcf.js');
var fs = require('fs');
var score = {home:0, guest:0};

/* this client will itself implement a Ping service */
var protocol = new tcf.Protocol();

protocol.addCommandHandler('Ping','echo', function (c, msg) {
    if (!msg) throw ({msg:'Invalid argument'});
    /* randomly fail to send the ball back */
    console.log ("received Ping");
    setTimeout(serve, 0);
    if (Math.random() < 0.25) {
        score.guest ++;
        return [{msg:'missed the ball'}];
    }
    return ([0,msg]);
});

var isGameOver = function () {
    return (score.home == 21 || score.guest == 21);
};

var serve = function () {
    if (isGameOver()) {
        console.log('game ended', score);
        if (client) {
            client.close();
            client = undefined;
        }
        return;
    }
    console.log ("send Pong");

    return client.sendCommand('Pong', 'echo', ['test'])
    .then(function (res) {
        if (res[0]) {
            console.log(res[0]);
            score.home ++;
            setTimeout(serve, 0);
        }
    })
    .catch(function (err){
        /* score the point */
        console.log ("catch :", err);
            score.home ++;
            setTimeout(serve, 0);
    });
};

/* test service ping */
var client = new tcf.Client(protocol);
var client2 = new tcf.Client(protocol);

var onClose = function() {
    console.log ('channel closed');
    client = undefined;
};

var onError = function(err) {
    console.log ('channel error', err);
};

var onConnect = function() {
    /* check that the service Pong is supported */
    if (client.getChannel().getPeerServices().indexOf("Pong") >= 0) {
        setTimeout (serve,0);
    }
};

client.connect('WSS:localhost:20001', {
    key: fs.readFileSync('test/certs/client1-key.pem'), 
    cert: fs.readFileSync('test/certs/client1-crt.pem'), 
    ca: fs.readFileSync('test/certs/ca-crt.pem')
}, onConnect, onError, onClose);
