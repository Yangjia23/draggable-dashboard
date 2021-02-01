import { ComponentData, BlockData, BlockPropsType, EditorSelectOptions, BlockProps, EditorTableConfig } from './types'

/**
 * @description 创建一个新的 block 区块
 * @param param0 top 区块位置 top
 * @param param1 left 区块位置 left
 * @param param2 component 区块中包裹的组件
 */
export function createNewBlock({
  top,
  left,
  component,
}: {
  top: number
  left: number
  component: ComponentData
}): BlockData {
  return {
    top,
    left,
    componentKey: component!.name,
    resizeLocation: true,
    focus: false,
    zIndex: 0,
    height: 0,
    width: 0,
    hasResize: false,
    props: {},
  }
}

/**
 * @description 创建一个组件菜单集合
 * @returns componentMap 组件 Mapping
 *          componentList 组件集合
 *          register 注册新组件的方法
 */

export function createComponentHandler() {
  const componentList: ComponentData[] = []
  const componentMap: Record<string, ComponentData> = {}

  return {
    componentMap,
    componentList,
    register: <Props extends Record<string, BlockProps> = {}>(
      name: string,
      component: {
        label: string
        preview: () => JSX.Element
        render: (data: { props: { [k in keyof Props]: any } }) => JSX.Element
        props?: Props
      },
    ) => {
      const comp = { ...component, name }
      if (!componentMap[name]) {
        componentMap[name] = comp
        componentList.push(comp)
      }
    },
  }
}

export type ComponentHandlerConfig = ReturnType<typeof createComponentHandler>

/** ---------- input --------- */
export function createEditorInputProp(label: string) {
  return {
    type: BlockPropsType.input,
    label,
  }
}
/** ---------- color --------- */
export function createEditorColorProp(label: string) {
  return {
    type: BlockPropsType.color,
    label,
  }
}
/** ---------- select --------- */
export function createEditorSelectProp(label: string, options: EditorSelectOptions) {
  return {
    type: BlockPropsType.select,
    label,
    options,
  }
}
/** ---------- table --------- */
export function createEditorTableProp(label: string, table: EditorTableConfig) {
  return {
    type: BlockPropsType.table,
    label,
    table,
  }
}

/** ---------- input --------- */
