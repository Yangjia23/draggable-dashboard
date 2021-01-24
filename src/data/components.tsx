import { ElButton, ElInput, ElRadio } from 'element-plus'
import { ComponentData } from '@/utils/types'

interface ComponentMap {
  [props: string]: ComponentData
}

const componentMap: ComponentMap = {
  button: {
    name: 'button',
    label: '按钮',
    preview: () => <ElButton>Button</ElButton>,
    render: () => <ElButton>Button</ElButton>,
  },
  title: {
    name: 'title',
    label: '标题',
    preview: () => <h2>Title</h2>,
    render: () => <h2>Title</h2>,
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
