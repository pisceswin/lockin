## lockin
Smart lock

### Installation
```
    $ npm install lockin
```

### Examples
```js

    var lock = require('lockin')();
    
    // key is String Or Array of Strings
    lock(key, (err, locking, done)=>{
        if(err) return;
        if(locking) return;
        
        ...
        
        done();
    });
```
