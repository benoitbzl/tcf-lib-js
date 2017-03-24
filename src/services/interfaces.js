/*
 * TCF Proxy interface
 *
 * Copyright (c) 2016-2017 Wind River Systems
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

var utils = require('../utils.js');

/**
 * Command definition.
 * @typedef {Object} CommandDef
 * @property {string} name - Command name.
 * @property {ParameterType[]} args - Command arguments definition.
 * @property {ParameterType[]} results - Command results definition.
 */

/**
 * Parameter type.
 * @typedef {Object} ParameterType
 * @property {string} [title] - Parameter access name.
 * @property {string} type - Parameter type: 'object', 'binary', 'array', 'string', 'boolean', 'integer'.
 */

var services = {
    Expressions: require('./interfaces/expressions.js'),
    FileSystem: require('./interfaces/filesystem.js'),
    LineNumbers: require('./interfaces/linenumbers.js'),
    Locator: require('./interfaces/locator.js'),
    Memory: require('./interfaces/memory.js'),
    MemoryMap: require('./interfaces/memorymap.js'),
    PathMap: require('./interfaces/pathmap.js'),
    ProcessesV1: require('./interfaces/processesv1.js'),
    Profiler: require('./interfaces/profiler.js'),
    RunControl: require('./interfaces/runcontrol.js'),
    StackTrace: require('./interfaces/stacktrace.js'),
    Streams: require('./interfaces/streams.js'),
    Symbols: require('./interfaces/symbols.js'),
    SysMonitor: require('./interfaces/sysmonitor.js'),
    Terminals: require('./interfaces/terminals.js'),
    PortForward: require('./interfaces/portforward.js'),
}

function addService(prototype) {
    utils.assert (!services[prototype.name]);
    services[prototype.name] = prototype;
};

function removeService(name) {
    delete services[name];
}

/**
 * Creates a new service proxy interface
 *
 * @class
 * @param {string} arg - Opensource service name
 * @param {Object} arg - Service interface definition
 * @param {string} arg.name - service name
 * @param {CommandDef[]} [arg.cmds] - commands definitions
 * @param {Object[]} [arg.evs] - events definition
 */

function Interface(arg) {

    if (typeof arg !== 'string' && typeof arg !== 'object') {
        throw new Error('Invalid argument ' + arg + ' for Interface constructor');
    }

    if (typeof arg === 'string') {
        // args is one of the opensource interface name
        var itf = services[arg];
        if (!itf) throw new Error('Interface ' + arg + ' is not supported');
        Object.assign(this, itf);
    }
    else {
        if (!arg.name) throw new Error('Invalid interface object: missing name property');
        this.name = arg.name;
        this.cmds = arg.cmds || [];
        this.evs = arg.evs || [];
    }
}

module.exports = {
    services : services,
    addService: addService,
    removeService: removeService,
    Interface: Interface
};
