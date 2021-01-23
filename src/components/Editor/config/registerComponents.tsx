import { ElButton } from 'element-plus'
import { createEditorComponent } from './editor-util'

const editorComp = createEditorComponent()

editorComp.register('title', {
  label: 'title',
  preview: () => 'title',
  render: () => 'title',
})

editorComp.register('button', {
  label: 'button',
  preview: () => <ElButton>Button</ElButton>,
  render: () => <ElButton>Button</ElButton>,
})

export default editorComp
