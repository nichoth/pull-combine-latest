var test = require('tape')
var S = require('pull-stream')
var Pushable = require('pull-pushable')
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
            t.error(err, 'should not have error')
            t.deepEqual(data, expected, 'should emit the right data')
        })
    )
})

test('error handling', function (t) {
    t.plan(2)

    var p1 = Pushable()
    var p2 = Pushable()

    function sink (source) {
        source(null, function onEvent (end, data) {
            if (end === true) return t.fail('should not end')
            if (end) return t.equal(end.message, 'test error',
                'should emit error once')
            t.deepEqual(data, ['data', 'more data'], 'should emit data once')
            source(null, onEvent)
        })
    }

    S(
        combine(p1, p2),
        sink
    )

    p1.push('data')
    p2.push('more data')
    p1.end(new Error('test error'))
    p2.push('data 3')
    p2.end(new Error('error 2'))
})
