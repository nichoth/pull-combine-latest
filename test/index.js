var test = require('tape')
var S = require('pull-stream')
var Pushable = require('pull-pushable')
var combine = require('../')

test('read from sync source', function (t) {
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

function asyncSource (count, timeout) {
    var i = 0
    timeout = timeout || 0
    return function (abort, cb) {
        if (i === count) return cb(true)
        setTimeout(function () {
            cb(null, i++)
        }, timeout)
    }
}

test('read from async source', function (t) {
    t.plan(2)

    var expected = [
        [0,0],
        [0,1],
        [0,2],
        [1,2],
        [1,3]
    ]

    S(
        combine(
            asyncSource(2, 50),
            asyncSource(4, 20)
        ),
        S.collect(function (err, data) {
            t.error(err, 'should not have error')
            t.deepEqual(data, expected, 'should emit the right data')
        })
    )
})


test('read from both sync and async sources', function (t) {
    t.plan(2)
    var expected = [
        [1,0],
        [2,0],
        [3,0],
        [3,1],
        [3,2]
    ]

    S(
        combine(S.values([1,2,3]), asyncSource(3)),
        S.collect(function (err, data) {
            t.error(err, 'should not have error')
            t.deepEqual(data, expected, 'should have the right data')
        })
    )
})

function SlowSink (t) {
    t.plan(5)
    var expected = [
        [0,0],
        [1,0],
        [1,1],
        [2,1],
        [2,2]
    ]
    var i = 0
    return function sink (source) {
        process.nextTick(() => {
            source(null, function onNext (end, data) {
                if (end) return
                t.deepEqual(data, expected[i],
                    'should emit the right data')
                i++
                process.nextTick(() => source(null, onNext))
            })
        })
    }
}

test('async consumer', function (t) {
    S(
        combine(S.values([0,1,2]), S.values([0,1,2])),
        SlowSink(t)
    )
})

// test('async consumer with async source', function (t) {
//     S(
//         combine(asyncSource(3), asyncSource(3)),
//         SlowSink(t)
//     )
// })

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

test('error before start', function (t) {
    t.plan(1)
    S(
        combine(S.values([1,2,3]), S.error(new Error('test'))),
        S.drain(function onData (d) {
            t.fail('should not emit data')
        }, function onEnd (err) {
            t.equal('test', err.message, 'should emit the error')
        })
    )
})
