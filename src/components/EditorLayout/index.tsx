import { defineComponent, PropType, computed, ref } from 'vue'

import { ComponentData, CanvasModelValue, BlockData } from '@/utils/types'
import { createNewBlock, ComponentHandlerConfig } from '@/utils/editor'
import useCommand from '@/components/CommandTool/useCommand'
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
    /**
     * @description Computed
     */
    const { blocks, contain } = dataModel.value
    const canvasStyles = computed(() => ({
      width: `${contain.width}px`,
      height: `${contain.height}px`,
    }))

    const blockStatus = computed(() => {
      const focus: BlockData[] = []
      const unFocus: BlockData[] = []
      dataModel.value.blocks.forEach(block => {
        ;(block.focus ? focus : unFocus).push(block)
      })
      return {
        focus,
        unFocus,
      }
    })

    /**
     * @description Methods
     */
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
      updateBlocks(blocks: BlockData[]) {
        console.log('blocks', blocks)

        dataModel.value = {
          ...dataModel.value,
          blocks,
        }

        console.log('dataModel.value ', dataModel.value)
      },
    }

    const canvasRef = ref({} as HTMLDivElement)

    // 从组件菜单拖拽组件到画布
    const dragHandler = (() => {
      let currentDragBlock = null as null | ComponentData
      const canvasHandle = {
        // 被拖拽组件进入画布，鼠标设置成“可放置”状态
        dragenter: (e: DragEvent) => {
          // e.dataTransfer!.dropEffect = 'move'
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
          e.dataTransfer!.dropEffect = 'grabbing'
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

    // 拖拽画布上的 Block
    const blockHandler = (() => {
      let dragState = {
        startX: 0,
        startY: 0,
        dragBlocks: [] as { left: number; top: number }[],
      }

      const mousemove = (e: MouseEvent) => {
        const durX = e.clientX - dragState.startX
        const durY = e.clientY - dragState.startY
        blockStatus.value.focus.forEach((block, index) => {
          block.top = dragState.dragBlocks[index].top + durY
          block.left = dragState.dragBlocks[index].left + durX
        })
      }

      const mouseup = () => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }

      const mousedown = (e: MouseEvent) => {
        console.log('mousedown e', e)
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          dragBlocks: blockStatus.value.focus.map(({ top, left }) => ({ top, left })),
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
      }
      return {
        mousedown,
      }
    })()

    // 点击画布上组件，focus选中，shift 多选
    const focusHandler = (() => ({
      block: {
        onMousedown: (e: MouseEvent, block: BlockData) => {
          e.stopPropagation()
          e.preventDefault()
          if (e.shiftKey) {
            block.focus = !block.focus
          } else if (!block.focus) {
            block.focus = true
            methods.clearFocus(block)
          }
          blockHandler.mousedown(e)
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

    const commander = useCommand({
      blockData: blockStatus,
      updateBlocks: methods.updateBlocks,
    })

    const commandTools = [
      { labe: '撤销', icon: 'icon-back', tip: 'ctrl + z', handler: commander.undo },
      { labe: '重做', icon: 'icon-forward', tip: 'ctrl + shift + z', handler: commander.redo },
      { labe: '删除', icon: 'icon-delete', tip: 'ctrl + d, delete, ', handler: () => commander.delete() },
    ]

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
            <div class='editor-command'>
              {commandTools.map(command => (
                <div class='command-item' onClick={command.handler}>
                  <span>{command.labe}</span>
                </div>
              ))}
            </div>
            <div class='editor-operate'>
              <div
                id='canvas'
                style={canvasStyles.value}
                ref={canvasRef}
                {...{
                  onMousedown: (e: MouseEvent) => focusHandler.canvas.onMousedown(e),
                }}
              >
                {dataModel.value.blocks &&
                  dataModel.value.blocks.map((block, index) => (
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
