"use strict";

var util = require('util');
var redis = require('redis');

const KEY_FORMAT = '%s:%s';

function Store(option) {
    var _self = this;
    this.timeout = option.timeout;
    this.secret = option.secret;
    this.log = option.log;

    this.CONNECTING = false;
    var redisOpt = option.redis || {};
    this.client = redis.createClient(redisOpt.host, redisOpt.port, redisOpt.opt);
    this.client.on('connect', function () {
        _self.CONNECTING = true;
        _self.log.info('redis connection');
    });
    this.client.on('end', function () {
        _self.CONNECTING = false;
        _self.log.warn('redis connection closed');
    });
    this.client.on('error', function (err) {
        _self.CONNECTING = false;
        _self.log.error(err.message);
    });
}
Store.prototype.lock = function (keys, callback) {
    if (!this.CONNECTING) return callback('ERR redis connection closed');
    var _self = this;
    var tmp_kv = [], tmpKeys = [], date = new Date().getTime();
    var multi = this.client.multi();

    if (typeof keys == 'string') tmpKeys.push(util.format(KEY_FORMAT, _self.secret, keys));
    else {
        keys.forEach((k)=> {
            tmpKeys.push(util.format(KEY_FORMAT, _self.secret, k));
        });
    }

    tmpKeys.forEach((k)=> {
        tmp_kv.push(k);
        tmp_kv.push(date);
    });
    multi.msetnx(tmp_kv);
    //multi.mget(tmpKeys);
    tmpKeys.forEach((k)=> {
        multi.expire(k, _self.timeout);
    });

    multi.exec((err, results)=> {
        if (err) return callback(err);
        if (results[0] == 0) { // EBUSY
            var multi = this.client.multi();

            return callback(null, true, ()=> '');
        }
        callback(null, false, _self.unlock.bind(_self, tmpKeys));
    });
};

Store.prototype.unlock = function (keys, callback) {
    var cb = callback;
    if (typeof cb != 'function') cb = ()=> '';

    var multi = this.client.multi();
    keys.forEach((k)=> {
        multi.del(k);
    });
    multi.exec((err, results)=> {
        cb(err, results);
    });
};

module.exports = Store;
