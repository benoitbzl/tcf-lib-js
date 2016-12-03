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
var utils = require('./proxies/utils.js');

var services = {
    Breakpoints: require('./proxies/breakpoints.js'),
    Diagnostics: require('./proxies/diagnostics.js'),
    
    Terminals : require('./proxies/terminals.js'),
    Streams: require('./proxies/streams.js'),
}

function addService(prototype) {
    utils.assert (!services[prototype.name]);
    services[prototype.name] = prototype;    
};

function removeService(name) {
    utils.assert (!services[prototype.name]);
    delete services[name];    
}

module.exports = {
    services : services,
    addService: addService,
    removeService: removeService,
    // Breakpoints: require('./proxies/breakpoints.js'),
    // Diagnostics: require('./proxies/diagnostics.js'),
    // Expressions: require('./proxies/expressions.js'),
    // FileSystem: require('./proxies/filesystem.js'),
    // LineNumbers: require('./proxies/linenumbers.js'),
    // Locator: require('./proxies/locator.js'),
    // Memory: require('./proxies/memory.js'),
    // MemoryMap: require('./proxies/memorymap.js'),
    // PathMap: require('./proxies/pathmap.js'),
    // ProcessesV1: require('./proxies/processesv1.js'),
    // Profiler: require('./proxies/profiler.js'),
    // RunControl: require('./proxies/runcontrol.js'),
    // StackTrace: require('./proxies/stacktrace.js'),
    // Streams: require('./proxies/streams.js'),
    // Symbols: require('./proxies/symbols.js'),
    // SysMonitor: require('./proxies/sysmonitor.js'),
};
