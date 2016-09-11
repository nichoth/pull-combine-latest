var S = require('pull-stream')
var combineLatest = require('../')

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
