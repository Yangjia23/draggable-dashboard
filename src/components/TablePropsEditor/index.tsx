import { defineComponent, PropType } from 'vue'
import './index.scss'
import { BlockProps } from '@/utils/types'
import { UPDATE_MODEL_EVENT } from '@/utils/constants'
import { ElButton, ElTag } from 'element-plus'
import useModel from '../EditorLayout/useModel'
import $$EditorService from './service'

const TablePropsEditor = defineComponent({
  props: {
    modelValue: { type: Array as PropType<any[]> },
    config: { type: Object as PropType<BlockProps>, required: true },
  },
  emits: [UPDATE_MODEL_EVENT],
  setup(props, ctx) {
    const model = useModel(
      () => props.modelValue,
      val => ctx.emit(UPDATE_MODEL_EVENT, val),
    )
    const methods = {
      onClick: async () => {
        console.log('click')
        const data = await $$EditorService({
          config: props.config,
          data: props.modelValue || [],
        })
        model.value = data
        // console.log('data', data)
      },
    }
    return () => {
      let content: JSX.Element
      if (!model.value || model.value.length === 0) {
        content = <ElButton icon='el-icon-plus' size='mini' {...({ onClick: methods.onClick } as any)}></ElButton>
      } else {
        content = model.value.map(item => <ElTag>{item[props.config.table!.showKey]}</ElTag>)
      }
      return <div>{content}</div>
    }
  },
})

export default TablePropsEditor
