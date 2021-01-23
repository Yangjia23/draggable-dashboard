import { defineComponent, PropType, computed } from 'vue'
import { BlockData } from './config/editor-util'

const EditorBlock = defineComponent({
  props: {
    blockData: {
      type: Object as PropType<BlockData>,
      required: true,
    },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      left: `${props.blockData.left}px`,
      top: `${props.blockData.top}px`,
    }))

    return () => (
      <div class='editor-block' style={blockStyles.value}>
        Block Editor
      </div>
    )
  },
})

export default EditorBlock
