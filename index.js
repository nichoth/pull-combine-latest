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
    var allEnded = false

    var abort = null
    var emit
    function source (_abort, emitNext) {
        if (_abort) {
            abort = _abort
            // if there is already a cb waiting, abort it.
            if (emit) emitNext(abort)
        }
        emit = emitNext
        drain()
    }

    function drain () {
      if (abort) return emit(abort)

      streams.forEach(function sink (s, i) {
          s(abort, function onData (end, data) {
              if (allEnded) return
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

