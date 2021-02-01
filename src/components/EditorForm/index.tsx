import { defineComponent, PropType, reactive, watch } from 'vue'
import { BlockData, BlockProps, BlockPropsType, CanvasModelValue } from '@/utils/types'
import { ElForm, ElFormItem, ElInputNumber, ElInput, ElColorPicker, ElSelect, ElOption, ElButton } from 'element-plus'
import { ComponentHandlerConfig } from '@/utils/editor'
import './index.scss'
import deepcopy from 'deepcopy'
import TablePropsEditor from '../TablePropsEditor'

const EditorForm = defineComponent({
  props: {
    block: {
      type: Object as PropType<BlockData>,
    },
    config: {
      type: Object as PropType<ComponentHandlerConfig>,
      required: true,
    },
    dataModel: {
      type: Object as PropType<{ value: CanvasModelValue }>,
      required: true,
    },
  },
  emits: {
    updateBlock: (data: { newBlock: BlockData; oldBlock: BlockData }) => true,
    updateCanvas: (data: CanvasModelValue) => true,
  },
  setup(props, ctx) {
    const state = reactive({
      model: {} as any,
    })

    const methods = {
      renderEditorItem: (propName: string, propConfig: BlockProps) =>
        ({
          [BlockPropsType.input]: () => <ElInput v-model={state.model[propName]} />,
          [BlockPropsType.color]: () => <ElColorPicker v-model={state.model[propName]} />,
          [BlockPropsType.select]: () => (
            <ElSelect v-model={state.model[propName]}>
              {propConfig.options!.map(opt => (
                <ElOption label={opt.label} value={opt.value}></ElOption>
              ))}
            </ElSelect>
          ),
          [BlockPropsType.table]: () => <TablePropsEditor v-model={state.model[propName]} config={propConfig} />,
        }[propConfig.type]()),
      apply: () => {
        if (props.block) {
          /** 更新组件 */
          ctx.emit('updateBlock', {
            newBlock: {
              ...props.block,
              props: state.model,
            },
            oldBlock: props.block,
          })
        } else {
          /** 更新容器 */
          ctx.emit('updateCanvas', {
            ...props.dataModel.value,
            contain: state.model,
          })
        }
      },
      reset: () => {
        console.log(3423)
        methods.init(props.block)
      },
      init: (value: BlockData | undefined) => {
        if (value) {
          /** 组件 */
          state.model = deepcopy(value.props || {})
        } else {
          /** 容器 */
          state.model = deepcopy(props.dataModel.value.contain)
        }
      },
    }

    watch(
      () => props.block,
      val => {
        methods.init(val)
      },
      { immediate: true },
    )

    return () => {
      let content: JSX.Element
      if (props.block) {
        const { componentKey } = props.block
        const { componentMap } = props.config
        const curComponent = componentMap[componentKey]
        if (curComponent && curComponent.props) {
          content = (
            <>
              {Object.entries(curComponent.props).map(([propName, propConfig]) => (
                <ElFormItem label={propConfig.label}>{methods.renderEditorItem(propName, propConfig)}</ElFormItem>
              ))}
            </>
          )
        } else {
          content = '123'
        }
      } else {
        content = (
          <>
            <ElFormItem label='屏幕宽度'>
              <ElInputNumber controls-position='right' v-model={state.model.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label='屏幕高度'>
              <ElInputNumber controls-position='right' v-model={state.model.height}></ElInputNumber>
            </ElFormItem>
          </>
        )
      }
      return (
        <div class='editor-form'>
          <ElForm label-position='top'>
            {content}
            <ElFormItem>
              <ElButton type='primary' {...({ onClick: () => methods.apply() } as any)}>
                应用
              </ElButton>
              <ElButton {...({ onClick: () => methods.reset() } as any)}>重置</ElButton>
            </ElFormItem>
          </ElForm>
        </div>
      )
    }
  },
})

export default EditorForm
