# Open source version of TCF library in JavaScript

TCF JavaScript library support both client and server (nodejs) configuration.

## Disclaimer 
This package is under heavy development and not ready for production. 
API compatibility is not guaranteed.

### Install

```
npm install
```

### generate a browser library

```
npm run dist
```

### generate the JSDOC

```
npm run doc
```

### Tests

```
npm test
```

### License
This code is released under the MIT License.

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```



### Usage

Description : To create a new tcf client use the following :
```js

var client = new tcf.Client();

    var tcf = require ('tcf');
    var client = new tcf.Client();
```

  The client object has the following properties :
```js
  {
    connect: function(peer, onConnect, onClose)
      peer is the tcf peer id of the form [WS or WSS]:[Hostname]:[Port]
      onConnect : function called when the tcf channel is established
      onClosed: function called when the tcf channel is closed
    close: function()
    svc: {}
      The svc object will be populated when the connection is established.
      It provides proxy function to send TCF commands for each service.
      Only services published by the remote peer are defined in the svc
      proxy i.e :

      Breakpoints: Object
        add: function (bpData, cb) {
        addListener: function (listener) {
        change: function (bpData, cb) {
        disable: function (bpIDList, cb) {
        enable: function (bpIDList, cb) {
        getCapabilities: function (ctxID, cb) {
        getIds: function (cb) {
        getProperties: function (bpID, cb) {
        getStatus: function (bpID, cb) {
        remove: function (bpIDList, cb) {
        removeListener: function (listener) {
        set: function (bpList, cb) {
        __proto__: Object
      LineNumbers: Object
        mapToMemory: function (ctxID, file, line, column, cb) {
        mapToSource: function (ctxID, addr0, addr1, cb) {
        __proto__: Object
      ...
  }
```

  Example to call a service function

  All service functions accept a callback that will be called unpon command completion :
```js

    c.svc['Breakpoints'].add({}, function (res){})
    The result of a particular command is an object :
    res = {
      err: [error object or null if successfull]
      [command specific return values]
    }
```

  Promises
  All service functions return a Promise that will resolve upon command completion.
  In this case the callback parameter can be ommitted.

  example :
```js
    c.svc.ProcessesV1.getChildren ("", false)
    .then (function (res) {
      //Success
    })
    .catch (function (err) {
      // Error
    });
```

  Note : all tcf transactions error result in a promise rejection.
  If you want to ignore some transaction errors without affecting the promise chain
  you'll need to wrap the service call in its own promise :

```js
    c.svc.ProcessesV1.getChildren (c, tree)
    .then (function (res) {
      // This error is expected so we encapsulate that
      // cal in a new promise that is resolved unconditionally.
      return new Promise( function (resolve, reject) {
        c.svc.ProcessesV1.detach(ctx.ID)
        .then(resolve)
        .catch(resolve);
      });
    })
    .then (function (res) {
      // Do the next thing
    })
```

  Service Events notification

    For services emitting events, you need to register an event listener as follow :
```js
    c.svc.RunControl.addListerner({
      'contextAdded' : function (ev) {...},
      'contextRemoved' : function (ev) {...},
      ...
    });
```



```js
var tcf = require('tcf');

var client = new tcf.Client();
var c = client.connect('WS:127.0.0.1:1234');

c.svc.ProcessesV1.getChildren ("", false)
.then (function (res) {
    //Success
})
.catch (function (err) {
    // Error
});
```

Note: special case to call tcf api with 64 argument value

```js
var JSONBig = require ('json-bigint'); 

val = '9223372036351367728';
client.svc.Memory.get("P3896", JSONbig.parse(val), 1, 672, 3)
.then (function (res) {
    //Success
})
.catch (function (err) {
    // Error
});

```

### Disclaimer of Warranty / No Support
Wind River does not provide support and maintenance services for this software, under Wind River's standard Software Support and Maintenance Agreement or otherwise. Unless required by applicable law, Wind River provides the software (and each contributor provides its contribution) on an "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, either express or implied, including, without limitation, any warranties of TITLE, NONINFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the software and assume any risks associated with your exercise of permissions under the license.


