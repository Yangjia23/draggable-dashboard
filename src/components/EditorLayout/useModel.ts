import { ref, watch } from 'vue'

export default function useModel<T>(getter: () => T, emitter: (val: T) => void) {
  const state = ref(getter()) as { value: T }

  watch(getter, nVal => {
    if (nVal !== state.value) {
      state.value = nVal
    }
  })

  return {
    get value() {
      return state.value
    },
    set value(nVal: T) {
      if (state.value !== nVal) {
        state.value = nVal
        emitter(nVal)
      }
    },
  }
}
