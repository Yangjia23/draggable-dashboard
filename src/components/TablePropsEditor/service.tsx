import { DropdownOption, BlockProps } from '@/utils/types'
import { defineComponent, PropType, getCurrentInstance, reactive, createApp, onMounted } from 'vue'
import { ElDialog, ElTable, ElButton, ElTableColumn, ElInput } from 'element-plus'
import deepcopy from 'deepcopy'
import { defer } from '../DialogService/defer'

export interface ServiceOption {
  data: any[]
  config: BlockProps
  onConfirm: (val: any[]) => void
}

const Component = defineComponent({
  props: {
    option: {
      type: Object as PropType<ServiceOption>,
      required: true,
    },
  },
  components: { ElButton, ElInput, ElDialog, ElTable, ElTableColumn },
  setup(props) {
    const ctx = getCurrentInstance()!

    const state = reactive({
      option: props.option,
      showFlag: false,
      mounted: (() => {
        const dfd = defer()
        onMounted(() => setTimeout(() => dfd.resolve(), 0))
        return dfd.promise
      })(),
      editData: [] as any[],
    })

    console.log('props', props)

    const methods = {
      service: (option: ServiceOption) => {
        state.option = option
        state.editData = deepcopy(option.data || [])
        methods.show()
      },
      show: async () => {
        await state.mounted
        state.showFlag = true
      },
      hide: () => {
        state.showFlag = false
      },
      add: () => {
        state.editData.push({})
      },
      reset: () => {
        state.editData = deepcopy(state.option.data || [])
      },
      onSubmit: () => {
        state.option.onConfirm(state.editData)
        methods.hide()
      },
      onCancel: () => {
        methods.hide()
      },
    }

    Object.assign(ctx.proxy, methods)

    return () => (
      <ElDialog modelValue={state.showFlag}>
        {{
          default: () => (
            <div>
              <ElButton {...({ onClick: methods.add } as any)}>添加</ElButton>
              <ElButton {...({ onClick: methods.reset } as any)}>重置</ElButton>
              <ElTable data={state.editData}>
                {props.option.config.table!.option.map((item, index) => (
                  <ElTableColumn {...({ label: item.label } as any)}>
                    {{
                      default: ({ row }: { row: any }) => <ElInput v-model={row[item.field]} />,
                    }}
                  </ElTableColumn>
                ))}
                <ElTableColumn {...({ label: '操作' } as any)}>
                  <ElButton type='text'>删除</ElButton>
                </ElTableColumn>
              </ElTable>
            </div>
          ),
          footer: () => (
            <div>
              <ElButton size='small' {...{ onClick: methods.onCancel }}>
                取消
              </ElButton>
              <ElButton type='primary' size='small' {...{ onClick: methods.onSubmit }}>
                确定
              </ElButton>
            </div>
          ),
        }}
      </ElDialog>
    )
  },
})

const $$EditorService = (() => {
  let ins: any
  return (option: Omit<ServiceOption, 'onConfirm'>) => {
    if (!ins) {
      const el = document.createElement('div')
      document.body.append(el)
      const app = createApp(Component, { option })
      ins = app.mount(el)
    }
    const dfd = defer<any[]>()
    ins.service({
      ...option,
      onConfirm: dfd.resolve,
    })
    return dfd.promise
  }
})()

export default $$EditorService
