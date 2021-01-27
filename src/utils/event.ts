type listenerFn = () => void

export default function createEvent() {
  const listeners: listenerFn[] = []
  return {
    on: (cb: listenerFn) => {
      listeners.push(cb)
    },
    off: (cb: listenerFn) => {
      const idx = listeners.indexOf(cb)
      if (idx > -1) {
        listeners.splice(idx, 1)
      }
    },
    emit: () => {
      listeners.forEach(cb => cb())
    },
  }
}
