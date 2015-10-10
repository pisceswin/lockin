"use strict";

function Store(option) {
    this.timeout = option.timeout;
    this.log = option.log;

    this.memory = {};
}
Store.prototype.lock = function (keys, callback) {
    var _self = this;
    var tmpKeys = [], date = new Date().getTime();

    if (typeof keys == 'string') tmpKeys.push(keys);
    else tmpKeys = keys;

    for (var i = 0; i < tmpKeys.length; i++) {
        var temp = _self.memory[tmpKeys[i]];
        if (temp == undefined) continue;
        if (typeof temp == 'object' && temp._expire <= date) continue;

        return callback(null, true, ()=> ''); // EBUSY
    }
    tmpKeys.forEach((k)=> {
        _self.memory[k] = {
            _expire: date + _self.timeout * 1000
        }
    });

    callback(null, false, _self.unlock.bind(_self, tmpKeys));
};

Store.prototype.unlock = function (keys, callback) {
    var cb = callback;
    if (typeof cb != 'function') cb = ()=> '';

    var _self = this;
    keys.forEach((k)=> {
        delete _self.memory[k];
    });
    cb();
};

module.exports = Store;
