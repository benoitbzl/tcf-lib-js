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

var schemas = require('../schemas.js')
var types = schemas.types;

var handle = {title: 'handle', type: 'string'};
var path = {title: 'path', type: 'string'};
var eof = {title: 'eof', type: 'boolean'};

module.exports = {
    name: "FileSystem",
    cmds: [
        {name: "open", args:[types.string, types.string, types.string], results: [types.err, handle]},
        {name: "close", args:[handle], results: [types.err]},
        {name: "read", args:[handle, types.integer, types.integer], results: [types.data, types.err, eof]},
        {name: "write", args:[handle, types.integer, types.data], results: [types.err, types.odata]},
        {name: "stat", args:[types.string], results: [types.err, types.odata]},
        {name: "remove", args:[types.string], results: [types.err, types.odata]},
        {name: "realpath", args:[path], results: [types.err, path]},
        {name: "mkdir", args:[types.string, types.string], results: [types.err]},
        {name: "rmdir", args:[types.string], results: [types.err]},
        {name: "copy", args:[types.string, types.string, types.string, types.string, types.string], results: [types.err]},
        {name: "opendir", args:[path], results: [types.err, handle]},
        {name: "readdir", args:[handle], results: [{title:'entries', type:'array'}, types.err, eof]},
    ],
    evs: []
};

module.exports.OpenModes = {
    /* File System Open modes */
    TCF_O_READ: 1,
    /* Open the file for reading */
    TCF_O_WRITE: 2,
    /* Open the file for writing */
    TCF_O_APPEND: 4,
    /* Force all writes to append data at the end of the file */
    TCF_O_CREAT: 8,
    /* If this flag is specified, then a new file will be created if one
     * does not already exist (if TCF_O_TRUNC is specified, the new file will
     * be truncated to zero length if it previously exists).
     */
    TCF_O_TRUNC: 16,
    /* Forces an existing file with the same name to be truncated to zero
     * length when creating a file by specifying TCF_O_CREAT.
     * TCF_O_CREAT MUST also be specified if this flag is used.
     */
    TCF_O_EXCL: 32
    /* Causes the request to fail if the named file already exists.
     * TCF_O_CREAT MUST also be specified if this flag is used.
     */
};

module.exports.FileAttrs = {
    /* File System Open modes */
    ATTR_SIZE: 1,
    /* File size is present in the FileAttrs object */
    ATTR_UIDGID: 2,
    /* User ID and Group ID are present in the FileAttrs object */
    ATTR_PERMISSIONS: 4,
    /* The file permissons are present in the FileAttrs object */
    ATTR_ACMODTIME: 8
    /* The access and modification times of the file are present in
       the FileAttrs object
    */
};

module.exports.Errors = {
    FSERR_EOF: 0x10001,
    FSERR_NO_SUCH_FILE: 0x10002,
    FSERR_PERMISSION_DENIED: 0x10003,
    FSERR_EPERM: 0x10004,
    FSERR_ESRCH: 0x10005,
    FSERR_EINTR: 0x10006,
    FSERR_EIO: 0x10007,
    FSERR_ENXIO: 0x10008,
    FSERR_E2BIG: 0x10009,
    FSERR_ENOEXEC: 0x1000a,
    FSERR_EBADF: 0x1000b,
    FSERR_ECHILD: 0x1000c,
    FSERR_EAGAIN: 0x1000d,
    FSERR_ENOMEM: 0x1000e,
    FSERR_EFAULT: 0x1000f,
    FSERR_EBUSY: 0x10010,
    FSERR_EEXIST: 0x10011,
    FSERR_EXDEV: 0x10012,
    FSERR_ENODEV: 0x10013,
    FSERR_ENOTDIR: 0x10014,
    FSERR_EISDIR: 0x10015,
    FSERR_EINVAL: 0x10016,
    FSERR_ENFILE: 0x10017,
    FSERR_EMFILE: 0x10018,
    FSERR_ENOTTY: 0x10019,
    FSERR_EFBIG: 0x1001a,
    FSERR_ENOSPC: 0x1001b,
    FSERR_ESPIPE: 0x1001c,
    FSERR_EROFS: 0x1001d,
    FSERR_EMLINK: 0x1001e,
    FSERR_EPIPE: 0x1001f,
    FSERR_EDEADLK: 0x10020,
    FSERR_ENOLCK: 0x10021,
    FSERR_EDOM: 0x10022,
    FSERR_ERANGE: 0x10023,
    FSERR_ENOSYS: 0x10024,
    FSERR_ENOTEMPTY: 0x10025,
    FSERR_ENAMETOOLONG: 0x10026,
    FSERR_ENOBUFS: 0x10027,
    FSERR_EISCONN: 0x10028,
    FSERR_ENOSTR: 0x10029,
    FSERR_EPROTO: 0x1002a,
    FSERR_EBADMSG: 0x1002b,
    FSERR_ENODATA: 0x1002c,
    FSERR_ETIME: 0x1002d,
    FSERR_ENOMSG: 0x1002e,
    FSERR_ETXTBSY: 0x1002f,
    FSERR_ELOOP: 0x10030,
    FSERR_ENOTBLK: 0x10031,
    FSERR_EMSGSIZE: 0x10032,
    FSERR_EDESTADDRREQ: 0x10033,
    FSERR_EPROTOTYPE: 0x10034,
    FSERR_ENOTCONN: 0x10035,
    FSERR_ESHUTDOWN: 0x10036,
    FSERR_ECONNRESET: 0x10037,
    FSERR_EOPNOTSUPP: 0x10038,
    FSERR_EAFNOSUPPORT: 0x10039,
    FSERR_EPFNOSUPPORT: 0x1003a,
    FSERR_EADDRINUSE: 0x1003b,
    FSERR_ENOTSOCK: 0x1003c,
    FSERR_ENETUNREACH: 0x1003d,
    FSERR_ENETRESET: 0x1003e,
    FSERR_ECONNABORTED: 0x1003f,
    FSERR_ETOOMANYREFS: 0x10040,
    FSERR_ETIMEDOUT: 0x10041,
    FSERR_ECONNREFUSED: 0x10042,
    FSERR_ENETDOWN: 0x10043,
    FSERR_EHOSTUNREACH: 0x10044,
    FSERR_EHOSTDOWN: 0x10045,
    FSERR_EINPROGRESS: 0x10046,
    FSERR_EALREADY: 0x10047,
    FSERR_ECANCELED: 0x10048,
    FSERR_EPROTONOSUPPORT: 0x10049,
    FSERR_ESOCKTNOSUPPORT: 0x1004a,
    FSERR_EADDRNOTAVAIL: 0x1004b
};
