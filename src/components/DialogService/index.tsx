import { defineComponent, reactive, PropType, createApp, getCurrentInstance } from 'vue'
import { ElButton, ElInput, ElDialog } from 'element-plus'
import { defer } from './defer'

enum DialogServiceEditType {
  textarea = 'textarea',
  input = 'input',
}
interface DialogServiceOpt {
  title?: string
  editType: DialogServiceEditType
  editReadonly?: boolean
  editValue?: string | null
  onConfirm: (value: string | null | undefined) => void
}

const generatorKey = (() => () => `auto_key_${Math.random() * 100}`)()

const DialogComponent = defineComponent({
  props: {
    option: {
      type: Object as PropType<DialogServiceOpt>,
      required: true,
    },
  },
  components: { ElButton, ElInput, ElDialog },
  setup(props) {
    const ctx = getCurrentInstance()!
    const state = reactive({
      showFlag: false,
      option: props.option,
      editValue: null as undefined | null | string,
      key: generatorKey(),
    })

    const methods = {
      service: (option: DialogServiceOpt) => {
        state.option = option
        state.editValue = option.editValue
        state.key = generatorKey()
        methods.show()
      },
      show: () => {
        state.showFlag = true
      },
      hide: () => {
        state.showFlag = false
      },
    }

    const handler = {
      onConfirm: () => {
        state.option.onConfirm(state.editValue)
        methods.hide()
      },
      onCancel: () => {
        methods.hide()
      },
    }

    Object.assign(ctx.proxy, methods)

    return () => (
      <ElDialog v-model={state.showFlag} title={state.option.title} key={state.key}>
        {{
          default: () => (
            <div>
              {state.option.editType === DialogServiceEditType.input ? (
                <ElInput v-model={state.editValue} />
              ) : (
                <ElInput type='textarea' {...{ rows: 10 }} v-model={state.editValue} />
              )}
            </div>
          ),
          footer: () => (
            <div>
              <ElButton {...({ onClick: handler.onCancel } as any)}>取消</ElButton>
              <ElButton {...({ onClick: handler.onConfirm } as any)}>确定</ElButton>
            </div>
          ),
        }}
      </ElDialog>
    )
  },
})

const DialogService = (() => {
  let ins: any
  return (option: DialogServiceOpt) => {
    if (!ins) {
      const el = document.createElement('div')
      document.body.append(el)
      const app = createApp(DialogComponent, { option })
      ins = app.mount(el) // app.mount 返回的就是 当前实例
    }
    ins.service(option)
  }
})()

const $$dialog = Object.assign(DialogService, {
  input: (initValue?: string, option?: Omit<DialogServiceOpt, 'editValue' | 'editType' | 'onConfirm'>) => {
    const dfd = defer<string | null | undefined>()
    const opt: DialogServiceOpt = {
      title: '请输入导入的数据',
      ...option,
      editValue: initValue,
      editType: DialogServiceEditType.input,
      onConfirm: dfd.resolve,
    }
    DialogService(opt)
    return dfd.promise
  },
  textarea: (initValue?: string, option?: Omit<DialogServiceOpt, 'editValue' | 'editType' | 'onConfirm'>) => {
    const dfd = defer<string | null | undefined>()
    const opt: DialogServiceOpt = {
      title: '导出的 JSON 数据',
      ...option,
      editValue: initValue,
      editType: DialogServiceEditType.textarea,
      onConfirm: dfd.resolve,
    }
    DialogService(opt)
    return dfd.promise
  },
})

export default $$dialog
