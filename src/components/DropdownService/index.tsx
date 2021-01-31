import { DropdownOption } from '@/utils/types'
import {
  defineComponent,
  PropType,
  getCurrentInstance,
  reactive,
  computed,
  createApp,
  onMounted,
  onBeforeUnmount,
  ref,
} from 'vue'
import './index.scss'
import { defer } from '../DialogService/defer'

const Dropdown = defineComponent({
  props: {
    option: {
      type: Object as PropType<DropdownOption>,
      required: true,
    },
  },
  setup(props) {
    const ctx = getCurrentInstance()!
    const el = ref({} as HTMLElement)
    const state = reactive({
      option: props.option,
      showFlag: false,
      top: 0,
      left: 0,
      mounted: (() => {
        const dfd = defer()
        onMounted(() => {
          setTimeout(() => dfd.resolve(), 0)
        })
        return dfd.promise
      })(),
    })

    const classes = computed(() => ['dropdown-menu', { 'dropdown-menu-show': state.showFlag }])

    const styles = computed(() => ({
      top: `${state.top}px`,
      left: `${state.left}px`,
    }))

    const methods = {
      show: async () => {
        await state.mounted // 确保第一次出现时，也有动画效果
        state.showFlag = true
      },
      hide: () => {
        state.showFlag = false
      },
      /** 点击空白处，隐藏右击菜单 */
      onMousedownDocument: (e: MouseEvent) => {
        if (state.showFlag && !el.value.contains(e.target as HTMLElement)) {
          methods.hide()
        }
      },
    }

    onMounted(() => document.body.addEventListener('mousedown', methods.onMousedownDocument))
    onBeforeUnmount(() => document.body.removeEventListener('mousedown', methods.onMousedownDocument))

    const service = (option: DropdownOption) => {
      state.option = option
      if ('addEventListener' in option.reference) {
        const { top, left, height } = option.reference.getBoundingClientRect()!
        state.top = top + height
        state.left = left
      } else {
        const { clientX, clientY } = option.reference
        state.top = clientY
        state.left = clientX
      }
      methods.show()
    }

    Object.assign(ctx.proxy, { service })

    return () => (
      <div class={classes.value} style={styles.value} ref={el}>
        {state.option.content()}
      </div>
    )
  },
})

export const DropdownOptionItem = defineComponent({
  props: {
    label: { type: String },
    icon: { type: String },
  },
  setup(props) {
    return () => (
      <div class='dropdown-menu-item'>
        <i class={`el-icon-${props.icon}`}></i>
        <span>{props.label}</span>
      </div>
    )
  },
})

// 前缀$$ 表示该组件丢失上下文，无法使用 inject 获取根结点通过 provider 提供的值
const $$dropdown = (() => {
  let ins: any
  return (option: DropdownOption) => {
    if (!ins) {
      const el = document.createElement('div')
      document.body.append(el)
      const app = createApp(Dropdown, { option })
      ins = app.mount(el)
    }
    ins.service(option)
  }
})()

export default $$dropdown
