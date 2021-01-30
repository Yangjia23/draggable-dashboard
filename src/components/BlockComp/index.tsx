import { defineComponent, PropType, computed, ref, onMounted } from 'vue'
import { BlockData } from '@/utils/types'
import { ComponentHandlerConfig } from '@/utils/editor'

import './index.scss'

const EditorBlock = defineComponent({
  props: {
    blockData: {
      type: Object as PropType<BlockData>,
      required: true,
    },
    config: {
      type: Object as PropType<ComponentHandlerConfig>,
      required: true,
    },
  },
  setup(props) {
    const blockRef = ref({} as HTMLDivElement)
    const blockStyles = computed(() => ({
      left: `${props.blockData.left}px`,
      top: `${props.blockData.top}px`,
      zIndex: props.blockData.zIndex,
    }))

    const blockClasses = computed(() => {
      const { blockData } = props
      return [
        'editor-block',
        {
          'editor-block-focus': blockData.focus,
        },
      ]
    })

    onMounted(() => {
      const { blockData } = props
      const { offsetWidth, offsetHeight } = blockRef.value
      if (blockData.resizeLocation) {
        blockData.top -= offsetHeight / 2
        blockData.left -= offsetWidth / 2
        blockData.resizeLocation = false
      }
    })

    return () => {
      const { config, blockData } = props
      const component = config.componentMap[blockData.componentKey]
      return (
        <div class={blockClasses.value} style={blockStyles.value} ref={blockRef}>
          {component.render()}
        </div>
      )
    }
  },
})

export default EditorBlock
