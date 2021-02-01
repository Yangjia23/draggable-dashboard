/** 组件 */
export interface ComponentData {
  name: string
  label: string
  preview: () => JSX.Element
  render: (data: { props: any }) => JSX.Element
  props?: Record<string, BlockProps>
}

export type EditorSelectOptions = {
  label: string
  value: string
}[]

/** 区块 */
export interface BlockData {
  top: number
  left: number
  componentKey: string // 组件的 key
  resizeLocation?: boolean // 调整位置
  focus: boolean // 是否选中
  zIndex: number // z-index 值
  width: number // 组件宽度
  height: number // 组件高度
  hasResize: boolean // 是否调整过宽高
  props: Record<string, any> // 组件设定的属性
}

/** 区块 Props Type */
export enum BlockPropsType {
  input = 'input',
  color = 'color',
  select = 'select',
}

/** 区块 Props Type */
export type BlockProps = {
  type: BlockPropsType
  label: string
} & {
  options?: EditorSelectOptions
}

/** 画布 */
export interface CanvasModelValue {
  contain: {
    width: number
    height: number
  }
  blocks: BlockData[]
}

/** 辅助线 */
export interface MarkLine {
  x: { left: number; showLeft: number }[]
  y: { top: number; showTop: number }[]
}

/** 右击菜单 */
export interface DropdownOption {
  reference: MouseEvent | HTMLElement // 目标对象
  content: () => JSX.Element
}
