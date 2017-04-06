module.exports = function combineLatest (streams) {
    var isObj = !Array.isArray(streams) && typeof streams !== 'function'
    if (!Array.isArray(streams) && !(isObj)) {
        streams = [].slice.call(arguments)
    }
    var keys = Object.keys(streams)
    if (isObj) {
        streams = keys.map(function (k) {
            return streams[k]
        })
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
    var err = null
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
        abort = _abort || abort
        _emit = emitNext
        drain()
    }

    function drain () {
        streams.forEach(function sink (s, i) {
            if (ended[i] || resolving[i]) return
            resolving[i] = true
            s(abort || err, function onData (end, data) {
                resolving[i] = false
                if (err) return
                if (end === true) {
                    ended[i] = true
                    allEnded = ended.every(function (e) {
                        return e === true
                    })
                    if (allEnded) emit(true)
                    return
                }

                err = end || err
                if (err) {
                    ended[i] = true
                    // need to abort all other sources
                    drain()
                    return emit(err)
                }

                buffer[i] = data
                if (!haveData) {
                    haveData = buffer.every(function (b) {
                        return b != null
                    })
                }

                if (haveData) {
                    if (!isObj) emit(null, [].concat(buffer))
                    else {
                        var val = {}
                        keys.forEach(function (k, i) {
                            val[k] = buffer[i]
                        })
                        emit(null, val)
                    }
                }
            })
        })
    }

    return source
}

