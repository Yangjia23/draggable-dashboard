import { ref, watch } from 'vue'

export interface BlockData {
  top: number
  left: number
  componentKey: string // 组件的 key
  resizeLocation?: boolean // 调整位置
}

export interface ModelValue {
  contain: {
    width: number
    height: number
  }
  blocks: BlockData[]
}

export function useModel<T>(getter: () => T, emitter: (val: T) => void) {
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

export interface EditorComponent {
  name: string
  label: string
  preview: () => JSX.Element
  render: () => JSX.Element
}

export function createEditorComponent() {
  const componentList: EditorComponent[] = []
  const componentMap: Record<string, EditorComponent> = {}

  return {
    componentMap,
    componentList,
    register: (name: string, component: Omit<EditorComponent, 'name'>) => {
      const comp = { ...component, name }
      if (!componentMap[name]) {
        componentMap[name] = comp
        componentList.push(comp)
      }
    },
  }
}

export type EditorComponentConfig = ReturnType<typeof createEditorComponent>
