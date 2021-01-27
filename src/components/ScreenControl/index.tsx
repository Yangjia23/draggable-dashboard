import { defineComponent, reactive } from 'vue'
import './index.scss'

const EditorLayout = defineComponent({
  props: {},
  setup(props, ctx) {
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
      selectValue: 'auto',
      sliderValue: 50,
    })
    return () => (
      <div class='screen-control'>
        <el-select size='mini' class='screen-control-select' v-model={state.selectValue}>
          {options.map(item => (
            <el-option key={item.value} label={item.label} value={item.value}></el-option>
          ))}
        </el-select>
        <i class='screen-control-icon el-icon-minus'></i>
        <el-slider class='screen-control-slider' max={200} v-model={state.sliderValue}></el-slider>
        <i class='screen-control-icon el-icon-plus'></i>
      </div>
    )
  },
})

export default EditorLayout
