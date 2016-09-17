module.exports = function combineLatest (streams) {
    if (!Array.isArray(streams)) {
        streams = [].slice.call(arguments)
    }
    var l = streams.length
    var buffer = []
    var ended = []
    var resolving = []
    while (l--) {
        buffer.push(null)
        ended.push(false)
        resolving.push(false)
    }
    var haveData = false
    var err = false
    var allEnded = false
    var queue = []

    var abort = null
    var _emit
    function emit (end, data) {
        if (!_emit) return queue.push([end, data])
        var cb = _emit
        _emit = null
        cb(end, data)
    }

    function source (_abort, emitNext) {
        if (queue.length) return emitNext.apply(null, queue.shift())
        if (_abort) {
            abort = _abort
            // if there is already a cb waiting, abort it.
            // if (_emit) emitNext(abort)
        }
        _emit = emitNext
        drain()
    }

    function drain () {
        // if (abort) return emit(abort)

        streams.forEach(function sink (s, i) {
            if (ended[i]) return
            if (resolving[i]) return
            resolving[i] = true
            s(abort, function onData (end, data) {
                resolving[i] = false
                if (err) return
                if (end === true) {
                    ended[i] = true
                    allEnded = ended.every(function (e) {
                        return e === true
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
                        return b != null
                    })
                }

                if (haveData) {
                    emit(null, [].concat(buffer))
                }
            })
        })
    }

    return source
}

