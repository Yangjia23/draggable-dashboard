import { ElButton, ElInput, ElRadio, ElSelect, ElOption } from 'element-plus'
import { ComponentData } from '@/utils/types'
import {
  createEditorInputProp,
  createEditorColorProp,
  createEditorSelectProp,
  createEditorTableProp,
} from '@/utils/editor'

interface ComponentMap {
  [props: string]: ComponentData
}

const componentMap: ComponentMap = {
  button: {
    name: 'button',
    label: '按钮',
    preview: () => <ElButton>Button</ElButton>,
    render: ({ props }) => (
      <ElButton type={props.type} size={props.size}>
        {props.text || '默认按钮'}
      </ElButton>
    ),
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
    preview: () => <span>Title</span>,
    render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{props.text || '默认标题'}</span>,
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
  select: {
    name: 'select',
    label: '选择器',
    preview: () => <ElSelect />,
    render: ({ props }) => (
      <ElSelect>
        {(props.options || []).map((opt: { label: string; value: string }, idx: number) => (
          <ElOption label={opt.label} value={opt.value}></ElOption>
        ))}
      </ElSelect>
    ),
    props: {
      table: createEditorTableProp('下拉选项', {
        option: [
          { label: '显示值', field: 'label' },
          { label: '绑定值', field: 'value' },
        ],
        showKey: 'label',
      }),
    },
  },
  radio: {
    name: 'radio',
    label: '单选框',
    preview: () => <ElRadio>北京</ElRadio>,
    render: () => <ElRadio>北京</ElRadio>,
  },
}

export default componentMap
