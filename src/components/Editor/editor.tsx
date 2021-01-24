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

    const canvasRef = ref({} as HTMLDivElement)

    const dragHandler = (() => {
      let currentDragBlock = null as null | EditorComponent
      const canvasHandle = {
        // 被拖拽组件进入画布，鼠标设置成“可放置”状态
        dragenter: (e: DragEvent) => {
          e.dataTransfer!.dropEffect = 'move'
        },
        // 被拖拽组件在画布上移动，禁止默认事件
        dragover: (e: DragEvent) => {
          e.preventDefault()
        },
        // 被拖拽组件离开画布，鼠标设置成“不可放置”状态
        dragleave: (e: DragEvent) => {
          e.dataTransfer!.dropEffect = 'none'
        },
        // 被拖拽组件防止到画布上
        drop: (e: DragEvent) => {
          console.log('currentDragBlock', currentDragBlock)
          const existBlocks = dataModel.value.blocks || []
          existBlocks.push({
            top: e.offsetY,
            left: e.offsetX,
            componentKey: currentDragBlock!.name,
          })
          dataModel.value = {
            ...dataModel.value,
            blocks: existBlocks,
          }
        },
      }
      const blockHandle = {
        // block组件 开始被拖拽
        dragstart: (e: DragEvent, component: EditorComponent) => {
          canvasRef.value.addEventListener('dragenter', canvasHandle.dragenter)
          canvasRef.value.addEventListener('dragover', canvasHandle.dragover)
          canvasRef.value.addEventListener('dragleave', canvasHandle.dragleave)
          canvasRef.value.addEventListener('drop', canvasHandle.drop)
          currentDragBlock = component
        },
        // block组件结束被拖拽
        dragend: (e: DragEvent) => {
          canvasRef.value.removeEventListener('dragenter', canvasHandle.dragenter)
          canvasRef.value.removeEventListener('dragover', canvasHandle.dragover)
          canvasRef.value.removeEventListener('dragleave', canvasHandle.dragleave)
          canvasRef.value.removeEventListener('drop', canvasHandle.drop)
          currentDragBlock = null
        },
      }
      return blockHandle
    })()

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
                  onDragstart: (e: DragEvent) => dragHandler.dragstart(e, component),
                  onDragend: dragHandler.dragend,
                } as unknown)}
              />
            ))}
          </aside>
          <main class='editor-center'>
            <div class='editor-operate'>
              <div id='canvas' style={canvasStyles.value} ref={canvasRef}>
                {blocks &&
                  blocks.map((block, index) => <EditorBlock config={props.config} blockData={block} key={index} />)}
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
