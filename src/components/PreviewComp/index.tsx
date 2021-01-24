import { defineComponent, PropType } from 'vue'

import { ComponentData } from '@/utils/types'
import './index.scss'

const PreviewComp = defineComponent({
  props: {
    component: {
      type: Object as PropType<ComponentData>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class='preview-component'>
        <span class='component-label'>{props.component.label}</span>
        {props.component.preview()}
      </div>
    )
  },
})

export default PreviewComp
