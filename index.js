"use strict";

//const NAME = 'lockIn';
const TIMEOUT = 60; // unit (s)
const SECRET = 'lockIn';
const DEFINED_MODE = 'memory';

const NULL_FUNCTION = ()=>'';

//var storeMap = {};

function Lock(opt) {
    if (!opt) opt = {};
    //if (opt.name === undefined) opt.name = NAME;
    //if (storeMap[opt.name]) return storeMap[opt.name];

    // log
    if (typeof opt.log != 'object') {
        if (opt.log === true) {
            opt.log = {};
            opt.log.info = console.info;
            opt.log.warn = console.error;
            opt.log.error = console.error;
        } else {
            opt.log = {};
            opt.log.info = opt.log.warn = opt.log.error = NULL_FUNCTION;
        }
    }

    if (opt.timeout === undefined) opt.timeout = TIMEOUT;
    if (opt.secret === undefined) opt.secret = SECRET;
    if (opt.mode === undefined) opt.mode = DEFINED_MODE;

    var store = new (require('./store/' + opt.mode))(opt);
    //storeMap[opt.name] = store.lock.bind(store);
    return store.lock.bind(store);
}


module.exports = Lock;
