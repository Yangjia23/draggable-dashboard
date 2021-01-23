import { defineComponent, PropType, computed, ref } from 'vue'

import EditorBlock from './editor-block'
import PreviewComp from '../PreviewComp'
import { ModelValue, EditorComponentConfig, EditorComponent, useModel } from './config/editor-util'
import './config/index.scss'

const Editor = defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<ModelValue>,
      required: true,
    },
    config: {
      type: Object as PropType<EditorComponentConfig>,
      required: true,
    },
  },
  // 定义派发事件类型
  emits: {
    'update：modelValue': (val?: ModelValue) => true,
  },
  components: {
    EditorBlock,
    PreviewComp,
  },
  setup(props, ctx) {
    const dataModel = useModel(
      () => props.modelValue,
      val => ctx.emit('update：modelValue', val),
    )
    const { blocks, contain } = dataModel.value
    const canvasStyles = computed(() => ({
      width: `${contain.width}px`,
      height: `${contain.height}px`,
    }))

    console.log('props.config', props.config)

    const canvasRef = ref({} as HTMLDivElement)

    const menuDraggier = {
      current: {
        component: null as null | EditorComponent,
      },
      dragstart: (e: DragEvent, component: EditorComponent) => {
        canvasRef.value.addEventListener('dragenter', menuDraggier.dragenter)
        canvasRef.value.addEventListener('dragover', menuDraggier.dragover)
        canvasRef.value.addEventListener('dragleave', menuDraggier.dragleave)
        canvasRef.value.addEventListener('drop', menuDraggier.drop)
        menuDraggier.current.component = component
      },
      dragenter: (e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'move'
        console.log('dragenter', e)
      },
      dragover: (e: DragEvent) => {
        e.preventDefault()
      },
      dragleave: (e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'none'
        console.log('dragleave', e)
      },
      dragend: (e: DragEvent) => {
        canvasRef.value.removeEventListener('dragenter', menuDraggier.dragenter)
        canvasRef.value.removeEventListener('dragover', menuDraggier.dragover)
        canvasRef.value.removeEventListener('dragleave', menuDraggier.dragleave)
        canvasRef.value.removeEventListener('drop', menuDraggier.drop)
        menuDraggier.current.component = null
      },
      drop: (e: DragEvent) => {
        console.log(menuDraggier.current.component)
        const existBlocks = dataModel.value.blocks || []
        existBlocks.push({
          top: e.offsetY,
          left: e.offsetX,
        })
        dataModel.value = {
          ...dataModel.value,
          blocks: existBlocks,
        }
      },
    }

    return () => (
      <div class='editor'>
        <header class='editor-header'>Editor Header</header>
        <section class='editor-container'>
          <aside class='editor-aside'>
            {props.config.componentList.map(component => (
              <PreviewComp
                component={component}
                {...({
                  draggable: true,
                  onDragstart: (e: DragEvent) => menuDraggier.dragstart(e, component),
                  onDragend: menuDraggier.dragend,
                } as unknown)}
              />
            ))}
          </aside>
          <main class='editor-center'>
            <div class='editor-operate'>
              <div id='canvas' style={canvasStyles.value} ref={canvasRef}>
                {blocks && blocks.map((block, index) => <EditorBlock blockData={block} key={index} />)}
              </div>
            </div>
            <footer class='editor-footer'>Footer</footer>
          </main>
          <aside class='editor-aside'>Right Aside</aside>
        </section>
      </div>
    )
  },
})

export default Editor
