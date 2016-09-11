var test = require('tape')
var S = require('pull-stream')
var combine = require('../')

test('combine latest', function (t) {
    t.plan(2)

    var expected = [
        [1,'a'],
        [2,'a'],
        [2,'b'],
        [3,'b'],
        [3,'c']
    ]

    S(
        combine(S.values([1,2,3]), S.values(['a','b','c'])),
        S.collect(function (err, data) {
            console.log('in here', data)
            t.error(err, 'should not have error')
            t.deepEqual(data, expected, 'should emit the right data')
        })
    )
})
