/** 组件 */
export interface ComponentData {
  name: string
  label: string
  preview: () => JSX.Element
  render: () => JSX.Element
}

/** 区块 */
export interface BlockData {
  top: number
  left: number
  componentKey: string // 组件的 key
  resizeLocation?: boolean // 调整位置
  focus: boolean // 是否选中
  zIndex: number // z-index 值
}

/** 画布 */
export interface CanvasModelValue {
  contain: {
    width: number
    height: number
  }
  blocks: BlockData[]
}
