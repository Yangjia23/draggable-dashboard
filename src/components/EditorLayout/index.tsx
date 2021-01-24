import { defineComponent, PropType, computed, ref } from 'vue'

import { ComponentData, CanvasModelValue, BlockData } from '@/utils/types'
import { createNewBlock, ComponentHandlerConfig } from '@/utils/editor'
import useModel from './useModel'
import EditorBlock from '../BlockComp'
import PreviewComp from '../PreviewComp'
import './index.scss'

const EditorLayout = defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<CanvasModelValue>,
      required: true,
    },
    config: {
      type: Object as PropType<ComponentHandlerConfig>,
      required: true,
    },
  },
  // 定义派发事件类型
  emits: {
    'update：modelValue': (val?: CanvasModelValue) => true,
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

    const methods = {
      clearFocus(block?: BlockData) {
        let blocks = dataModel.value.blocks || []
        if (!blocks.length) return
        if (block) {
          blocks = blocks.filter(item => item !== block)
        }
        blocks.forEach(item => {
          item.focus = false
        })
      },
    }

    const canvasRef = ref({} as HTMLDivElement)

    // 从组件菜单拖拽组件到画布
    const dragHandler = (() => {
      let currentDragBlock = null as null | ComponentData
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
          existBlocks.push(
            createNewBlock({
              top: e.offsetY,
              left: e.offsetX,
              component: currentDragBlock!,
            }),
          )
          dataModel.value = {
            ...dataModel.value,
            blocks: existBlocks,
          }
        },
      }
      const blockHandle = {
        // block组件 开始被拖拽
        dragstart: (e: DragEvent, component: ComponentData) => {
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

    // 点击画布上组件，focus选中，shift 多选
    const focusHandler = (() => ({
      block: {
        onMousedown: (e: MouseEvent, block: BlockData) => {
          e.stopPropagation()
          e.preventDefault()
          if (e.shiftKey) {
            block.focus = !block.focus
          } else {
            block.focus = true
            methods.clearFocus(block)
          }
        },
      },
      canvas: {
        onMousedown: (e: MouseEvent) => {
          methods.clearFocus()
          e.stopPropagation()
          e.preventDefault()
        },
      },
    }))()

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
              <div
                id='canvas'
                style={canvasStyles.value}
                ref={canvasRef}
                {...{
                  onMousedown: (e: MouseEvent) => focusHandler.canvas.onMousedown(e),
                }}
              >
                {blocks &&
                  blocks.map((block, index) => (
                    <EditorBlock
                      config={props.config}
                      blockData={block}
                      key={index}
                      {...{
                        onMousedown: (e: MouseEvent) => focusHandler.block.onMousedown(e, block),
                      }}
                    />
                  ))}
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

export default EditorLayout
