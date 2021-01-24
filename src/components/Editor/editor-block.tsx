import { defineComponent, PropType, computed } from 'vue'
import { BlockData, EditorComponentConfig } from './config/editor-util'

const EditorBlock = defineComponent({
  props: {
    blockData: {
      type: Object as PropType<BlockData>,
      required: true,
    },
    config: {
      type: Object as PropType<EditorComponentConfig>,
      required: true,
    },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      left: `${props.blockData.left}px`,
      top: `${props.blockData.top}px`,
    }))

    return () => {
      const { config, blockData } = props
      const component = config.componentMap[blockData.componentKey]
      return (
        <div class='editor-block' style={blockStyles.value}>
          {component.render()}
        </div>
      )
    }
  },
})

export default EditorBlock
