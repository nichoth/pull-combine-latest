module.exports = function combineLatest (streams) {
    if (!Array.isArray(streams)) {
        streams = [].slice.call(arguments)
    }
    var l = streams.length
    var buffer = []
    var ended = []
    while (l--) {
        buffer.push(null)
        ended.push(false)
    }
    var haveData = false
    var err = false

    var abort = null
    var emit
    function source (_abort, emitNext) {
        abort = _abort
        emit = emitNext
    }

    streams.forEach(function sink (s, i) {
        process.nextTick(function () {
            if (err) return
            s(abort, function onData (end, data) {
                if (err) return
                if (end === true) {
                    ended[i] = true
                    var allEnded = ended.every(function (e) {
                        return e
                    })
                    if (allEnded) {
                        emit(true)
                    }
                    return
                }

                err = end || err
                if (err) {
                    return emit(err)
                }

                buffer[i] = data
                if (!haveData) {
                    haveData = buffer.every(function (b) {
                        return b
                    })
                }
                if (haveData) {
                    emit(null, [].concat(buffer))
                }

                process.nextTick(function () {
                    s(abort, onData)
                })
            })
        })
    })

    return source
}

