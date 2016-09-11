# pull combine latest

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
```
