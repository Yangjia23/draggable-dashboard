import { defineComponent, computed } from 'vue'
import './index.scss'

const RulerTool = defineComponent({
  props: {
    width: {
      type: Number,
      required: true,
    },
  },
  setup(props, ctx) {
    const canvasStyles = computed(() => ({
      width: `${props.width}px`,
      height: '20px',
    }))
    return () => (
      <div class='ruler-container'>
        <canvas class='canvas-ruler' style={canvasStyles.value}></canvas>
        <div class='lines-wrapper'></div>
      </div>
    )
  },
})

export default RulerTool
