var assert = require("assert");
describe('LockIn', function () {
    function Test_T() {
        var lock = require('../')({mode: this});
        it('lock', function (exit) {
            var key = 'test_key_' + Math.random();
            lock(key, (err, locking, done)=> {
                if (err) throw err;
                if (locking) throw key + ' is locking';

                lock(key, (err, locking)=> {
                    if (err) throw err;
                    if (!locking) throw key + ' is not locking';
                    done();
                    exit();
                });
            });
        });

        it('unlock', function (exit) {
            var key = 'test_key_' + Math.random();
            lock(key, (err, locking, done)=> {
                if (err) throw err;
                if (locking) throw key + ' is locking';
                done();
                lock(key, (err, locking, done)=> {
                    if (err) throw err;
                    if (locking) throw key + ' is locking';
                    done();
                    exit();
                });
            });
        });
    }

    describe('#memory', Test_T.bind('memory'));
    describe('#redis', Test_T.bind('redis'));
});

