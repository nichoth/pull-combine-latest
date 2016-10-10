# pull combine latest [![Build Status](https://travis-ci.org/nichoth/pull-combine-latest.svg?branch=master)](https://travis-ci.org/nichoth/pull-combine-latest)

Combine the latest values from many streams. The algorithm waits until every stream has emitted a value, then emits a new array whenever one of the streams has more data.

## install

    $ npm install pull-combine-latest

## example

```js
var S = require('pull-stream')
var combineLatest = require('pull-combine-latest')

S(
    // pass an array of streams
    combineLatest([S.values([1,2,3]), S.values(['a','b','c'])]),
    S.log()
)

S(
    // or pass streams as arguments
    combineLatest(S.values([1,2,3]), S.values(['a','b','c'])),
    S.log()
)

/*
output:

    [1,'a']
    [2,'a']
    [2,'b']
    [3,'b']
    [3,'c']

*/


// new data is emitted as soon as it is received, so sync data will always
// be emitted before async data
S(
    combineLatest(S.values([1,2,3]), asyncValues(['a','b','c'])),
    S.log()
)
/*
    [1,'a']
    [2,'a']
    [3,'a']
    [3,'b']
    [3,'c']
*/


// object map
S(
    combineLatest({
        a: S.values([1,2,3]),
        b: S.values([1,2,3])
    }),
    S.log()
)
/*
    { a: 1, b: 1 }
    { a: 2, b: 1 }
    { a: 2, b: 2 }
    { a: 3, b: 2 }
    { a: 3, b: 3 }
*/
```
