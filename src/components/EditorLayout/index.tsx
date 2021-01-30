import { defineComponent, PropType, computed, ref, reactive } from 'vue'

import { ComponentData, CanvasModelValue, BlockData } from '@/utils/types'
import { createNewBlock, ComponentHandlerConfig } from '@/utils/editor'
import useCommand from '@/components/CommandTool/useCommand'
import createEvent from '@/utils/event'
import useModel from './useModel'
import EditorBlock from '../BlockComp'
import PreviewComp from '../PreviewComp'
import ScreenControl from '../ScreenControl'
import RulerTool from '../RulerTool'
import './index.scss'
import $$dialog from '../DialogService'

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
    ScreenControl,
    RulerTool,
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

    const state = reactive({
      title: '测试大屏',
      leftAsideCollapse: false,
      rightAsideCollapse: false,
      toolboxCollapse: false,
      screenScaleValue: 50,
    })

    const canvasStyles = computed(() => ({
      width: `${contain.width}px`,
      height: `${contain.height}px`,
      background: `#0e2b43`,
      transform: `scale(${state.screenScaleValue / 100}) translate(0px, 0px)`,
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
        console.log('执行ing', blocks)
        dataModel.value = {
          ...dataModel.value,
          blocks,
        }
      },
    }

    const canvasRef = ref({} as HTMLDivElement)

    // 拖拽开始监听器
    const dragStartEvent = createEvent()
    // 拖拽结束监听器
    const dragEndEvent = createEvent()

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
        // 被拖拽组件放置到画布上
        drop: (e: DragEvent) => {
          console.log('currentDragBlock', currentDragBlock)
          // const existBlocks = dataModel.value.blocks || []
          const blocks = [...dataModel.value.blocks]
          blocks.push(createNewBlock({ top: e.offsetY, left: e.offsetX, component: currentDragBlock! }))
          console.log('blocks after drop', blocks)
          methods.updateBlocks(blocks)
          dragEndEvent.emit()
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
          dragStartEvent.emit()
        },
        // block组件结束被拖拽
        dragend: (e: DragEvent) => {
          canvasRef.value.removeEventListener('dragenter', canvasHandle.dragenter)
          canvasRef.value.removeEventListener('dragover', canvasHandle.dragover)
          canvasRef.value.removeEventListener('dragleave', canvasHandle.dragleave)
          canvasRef.value.removeEventListener('drop', canvasHandle.drop)
          currentDragBlock = null
          // dragEndEvent.emit()
        },
      }
      return blockHandle
    })()

    // 拖拽画布上的 Block
    const blockHandler = (() => {
      let dragState = {
        startX: 0,
        startY: 0,
        isDragging: false,
        dragBlocks: [] as { left: number; top: number }[],
      }

      const mousemove = (e: MouseEvent) => {
        if (!dragState.isDragging) {
          dragState.isDragging = true
          dragStartEvent.emit()
        }
        const durX = e.clientX - dragState.startX
        const durY = e.clientY - dragState.startY
        blockStatus.value.focus.forEach((block, index) => {
          block.top = dragState.dragBlocks[index].top + durY
          block.left = dragState.dragBlocks[index].left + durX
        })
      }

      const mouseup = () => {
        if (dragState.isDragging) {
          dragState.isDragging = false
          dragEndEvent.emit()
        }
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }

      const mousedown = (e: MouseEvent) => {
        console.log('mousedown e', e)
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          isDragging: false,
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
          if (e.shiftKey) {
            if (blockStatus.value.focus.length <= 1) {
              block.focus = true
            } else {
              block.focus = !block.focus
            }
          } else if (!block.focus) {
            block.focus = true
            methods.clearFocus(block)
          }
          blockHandler.mousedown(e)
        },
      },
      canvas: {
        // 点击空白处，清空选中
        onMousedown: (e: MouseEvent) => {
          e.preventDefault()
          if (e.currentTarget !== e.target) {
            return
          }
          if (!e.shiftKey) {
            methods.clearFocus()
          }
        },
      },
    }))()

    const commander = useCommand({
      blockDataModel: dataModel,
      updateBlocks: methods.updateBlocks,
      dragStartEvent,
      dragEndEvent,
    })

    const commandTools = [
      { label: '撤销', icon: 'top-left', tip: 'ctrl + z', handler: commander.undo },
      { label: '重做', icon: 'top-right', tip: 'ctrl + shift + z', handler: commander.redo },
      {
        label: '导入',
        icon: 'top-right',
        handler: async () => {
          const text = await $$dialog.textarea()
          try {
            const value = JSON.parse(text || '')
            dataModel.value = value
          } catch (error) {
            console.error(error)
          }
        },
      },
      {
        label: '导出',
        icon: 'top-right',
        handler: async () => $$dialog.textarea(JSON.stringify(dataModel.value), { editReadonly: true }),
      },
      { label: '置顶', icon: 'top', tip: 'ctrl + up', handler: () => commander.placeTop() },
      { label: '置顶', icon: 'bottom', tip: 'ctrl + down', handler: () => commander.placeBottom() },
      { label: '删除', icon: 'delete', tip: 'ctrl + d, delete, ', handler: () => commander.delete() },
      { label: '清空', icon: 'delete', handler: () => commander.clear() },
    ]

    const collapseContrList = [
      { label: '组件列表', icon: 'el-icon-menu', clickTargetKey: 'leftAsideCollapse' },
      { label: '右侧面板', icon: 'el-icon-s-unfold', clickTargetKey: 'rightAsideCollapse' },
      { label: '工具栏', icon: 'el-icon-takeaway-box', clickTargetKey: 'toolboxCollapse' },
    ]

    type collapseKey = 'leftAsideCollapse' | 'rightAsideCollapse' | 'toolboxCollapse'
    const collapseMethods = {
      onCollapseToggle(key: collapseKey) {
        state[key] = !state[key]
      },
    }

    const mainCanvasState = reactive({
      screenW: document.body.clientWidth,
      screenH: document.body.clientHeight,
    })

    return () => (
      <div class='editor'>
        <header class='editor-header'>
          <div class='editor-header-left'>
            {collapseContrList.map(item => (
              <el-tooltip effect='dark' content={item.label} placement='bottom'>
                <el-button
                  type='primary'
                  size='mini'
                  icon={item.icon}
                  class='editor-btn'
                  onClick={() => collapseMethods.onCollapseToggle(item.clickTargetKey as collapseKey)}
                ></el-button>
              </el-tooltip>
            ))}
          </div>
          <div class='editor-header-center'>
            <i class='el-icon-monitor'></i>
            <span class='title'>{state.title}</span>
          </div>
          <div class='editor-header-right'>
            <el-tooltip effect='dark' content='预览' placement='bottom'>
              <el-button type='primary' class='editor-btn' size='mini' icon='el-icon-monitor'></el-button>
            </el-tooltip>
            <el-tooltip effect='dark' content='发布' placement='bottom'>
              <el-button type='primary' class='editor-btn' size='mini' icon='el-icon-s-promotion'></el-button>
            </el-tooltip>
          </div>
        </header>
        <section class='editor-container'>
          <aside class={['editor-aside', { hide: state.leftAsideCollapse }]}>
            <div class='editor-aside-top'>
              <span class='editor-aside-title'>图层</span>
              <i class='editor-aside-toggle el-icon-arrow-left'></i>
            </div>
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
            <div class={['toolbox-panel', { hide: state.toolboxCollapse }]}>
              {commandTools.map(command => {
                const content = (
                  <el-button
                    type='primary'
                    size='mini'
                    plain
                    class='toolbox-item'
                    icon={`el-icon-${command.icon}`}
                    onClick={command.handler}
                  >
                    {command.label}
                  </el-button>
                )
                return !command.tip ? (
                  content
                ) : (
                  <el-tooltip effect='dark' content={command.tip} placement='bottom'>
                    {content}
                  </el-tooltip>
                )
              })}
            </div>
            <div class='editor-operate'>
              <RulerTool class='ruler-wrapper h-container' width={mainCanvasState.screenW} />
              <RulerTool class='ruler-wrapper v-container' width={mainCanvasState.screenH} />
              <div class='corner'></div>
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
            <footer class='editor-footer'>
              <ScreenControl v-model={state.screenScaleValue} />
            </footer>
          </main>
          <aside class={['editor-aside', { hide: state.rightAsideCollapse }]}>
            <div class='editor-aside-top'>
              <span class='editor-aside-title'>页面设置</span>
            </div>
          </aside>
        </section>
      </div>
    )
  },
})

export default EditorLayout
