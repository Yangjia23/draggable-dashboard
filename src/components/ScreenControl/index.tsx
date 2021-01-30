import { defineComponent, reactive } from 'vue'
import { UPDATE_MODEL_EVENT } from '@/utils/constants'
import './index.scss'

const EditorLayout = defineComponent({
  props: {
    modelValue: {
      type: Number,
    },
  },
  emits: [UPDATE_MODEL_EVENT],
  setup(props, ctx) {
    console.log(props.modelValue)
    const options = [
      {
        label: '200%',
        value: 200,
      },
      {
        label: '150%',
        value: 150,
      },
      {
        label: '100%',
        value: 100,
      },
      {
        label: '50%',
        value: 50,
      },
      {
        label: '自适应',
        value: 'auto',
      },
    ]
    const state = reactive({
      scaleValue: props.modelValue,
      // sliderValue: props.modelValue,
    })

    const methods = {
      onScaleChange: (value: number | string) => {
        if (value === 'auto') {
          ctx.emit(UPDATE_MODEL_EVENT, 50)
        }
        ctx.emit(UPDATE_MODEL_EVENT, value)
      },
    }
    return () => (
      <div class='screen-control'>
        {/* <el-select size='mini'
          class='screen-control-select'
          v-model={state.scaleValue}
          onChange={ methods.onScaleChange }
          >
          {options.map(item => (
            <el-option key={item.value} label={item.label} value={item.value}></el-option>
          ))}
        </el-select> */}
        <i class='screen-control-icon el-icon-minus'></i>
        <el-slider
          class='screen-control-slider'
          max={200}
          step={5}
          v-model={state.scaleValue}
          onChange={methods.onScaleChange}
        ></el-slider>
        <i class='screen-control-icon el-icon-plus'></i>
      </div>
    )
  },
})

export default EditorLayout
