import { ComponentData, BlockData } from './types'

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
    register: (name: string, component: Omit<ComponentData, 'name'>) => {
      const comp = { ...component, name }
      if (!componentMap[name]) {
        componentMap[name] = comp
        componentList.push(comp)
      }
    },
  }
}

export type ComponentHandlerConfig = ReturnType<typeof createComponentHandler>
