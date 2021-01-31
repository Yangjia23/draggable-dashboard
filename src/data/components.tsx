import { ElButton, ElInput, ElRadio } from 'element-plus'
import { ComponentData } from '@/utils/types'
import { createEditorInputProp, createEditorColorProp, createEditorSelectProp } from '@/utils/editor'

interface ComponentMap {
  [props: string]: ComponentData
}

const componentMap: ComponentMap = {
  button: {
    name: 'button',
    label: '按钮',
    preview: () => <ElButton>Button</ElButton>,
    render: () => <ElButton>Button</ElButton>,
    props: {
      text: createEditorInputProp('按钮文本'),
      type: createEditorSelectProp('按钮类型', [
        { label: '默认', value: '' },
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
        { label: '文本', value: 'text' },
      ]),
      size: createEditorSelectProp('按钮大小', [
        { label: '默认', value: '' },
        { label: '中等', value: 'medium' },
        { label: '小型', value: 'small' },
        { label: '超小', value: 'mini' },
      ]),
    },
  },
  title: {
    name: 'title',
    label: '标题',
    preview: () => <h2>Title</h2>,
    render: () => <h2>Title</h2>,
    props: {
      text: createEditorInputProp('显示文本'),
      color: createEditorColorProp('字体颜色'),
      size: createEditorSelectProp('字体大小', [
        { label: '12px', value: '12px' },
        { label: '14px', value: '14px' },
        { label: '16px', value: '16px' },
        { label: '18px', value: '18px' },
      ]),
    },
  },
  input: {
    name: 'input',
    label: '输入框',
    preview: () => <ElInput placeholder='请输入内容'></ElInput>,
    render: () => <ElInput placeholder='请输入内容'></ElInput>,
  },
  radio: {
    name: 'radio',
    label: '单选框',
    preview: () => <ElRadio>北京</ElRadio>,
    render: () => <ElRadio>北京</ElRadio>,
  },
}

export default componentMap
