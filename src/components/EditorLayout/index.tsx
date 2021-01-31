import { defineComponent, PropType, computed, ref, reactive } from 'vue'

import { ComponentData, CanvasModelValue, BlockData, MarkLine } from '@/utils/types'
import { createNewBlock, ComponentHandlerConfig } from '@/utils/editor'
import useCommand from '@/components/CommandTool/useCommand'
import createEvent from '@/utils/event'
import useModel from './useModel'
import EditorBlock from '../BlockComp'
import EditorForm from '../EditorForm'
import PreviewComp from '../PreviewComp'
import ScreenControl from '../ScreenControl'
import RulerTool from '../RulerTool'
import './index.scss'
import $$dialog from '../DialogService'
import $$dropdown, { DropdownOptionItem } from '../DropdownService'

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
    EditorForm,
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
    const state = reactive({
      title: '测试大屏',
      leftAsideCollapse: false,
      rightAsideCollapse: false,
      toolboxCollapse: false,
      screenScaleValue: 50,
    })

    const xxState = reactive({
      selectBlock: undefined as undefined | BlockData, // 当前选中的组件
    })

    const canvasStyles = computed(() => ({
      width: `${dataModel.value.contain.width}px`,
      height: `${dataModel.value.contain.height}px`,
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
        // console.log('执行ing', blocks)
        dataModel.value = {
          ...dataModel.value,
          blocks,
        }
      },
      showBlockData(block: BlockData) {
        $$dialog.textarea(JSON.stringify(block), {
          title: '当前节点数据',
          editReadonly: true,
        })
      },
      importBlockData: async (block: BlockData) => {
        const text = await $$dialog.textarea('', { title: '请输入节点JSON字符串' })
        try {
          const data = JSON.parse(text || '')
          commander.updateBlock(data, block)
        } catch (error) {
          console.error(error)
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
          // console.log('currentDragBlock', currentDragBlock)
          // const existBlocks = dataModel.value.blocks || []
          const blocks = [...dataModel.value.blocks]
          blocks.push(createNewBlock({ top: e.offsetY, left: e.offsetX, component: currentDragBlock! }))
          // console.log('blocks after drop', blocks)
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
      const markState = reactive({
        x: null as null | number,
        y: null as null | number,
      })

      let dragState = {
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        isDragging: false,
        dragBlocks: [] as { left: number; top: number }[],
        markLines: {} as MarkLine,
      }

      const mousemove = (e: MouseEvent) => {
        if (!dragState.isDragging) {
          dragState.isDragging = true
          dragStartEvent.emit()
        }
        let { clientX: moveX, clientY: moveY } = e
        const { startX, startY } = dragState

        if (e.shiftKey) {
          // 按住shift,只能在水平/垂直方向上移动
          if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
            moveX = startX
          } else {
            moveY = startY
          }
        }

        const currentTop = dragState.startTop + moveY - startY
        const currentLeft = dragState.startLeft + moveX - startX
        const currentMark = {
          x: null as null | number,
          y: null as null | number,
        }

        for (let i = 0; i < dragState.markLines.y.length; i++) {
          const { top, showTop } = dragState.markLines.y[i]
          if (Math.abs(top - currentTop) < 5) {
            moveY = top + startY - dragState.startTop
            currentMark.y = showTop
            break
          }
        }
        for (let i = 0; i < dragState.markLines.x.length; i++) {
          const { left, showLeft } = dragState.markLines.x[i]
          if (Math.abs(left - currentLeft) < 5) {
            moveX = left + startX - dragState.startLeft
            currentMark.x = showLeft
            break
          }
        }

        markState.x = currentMark.x
        markState.y = currentMark.y

        const durX = moveX - startX
        const durY = moveY - startY
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
        markState.x = null
        markState.y = null
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }

      const mousedown = (e: MouseEvent) => {
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          startLeft: xxState.selectBlock!.left,
          startTop: xxState.selectBlock!.top,
          isDragging: false,
          dragBlocks: blockStatus.value.focus.map(({ top, left }) => ({ top, left })),
          markLines: (() => {
            const { focus, unFocus } = blockStatus.value
            const { left, top, width, height } = xxState.selectBlock!

            const lines: MarkLine = { x: [], y: [] }
            unFocus.forEach(block => {
              const { top: t, left: l, width: w, height: h } = block
              // top: 对齐时当前正在拖动的组件的 top 值
              // showTop: 对齐时辅助线出现的位置 top 值
              lines.y.push({ top: t, showTop: t }) // (selectBlock)顶部 对齐 (unFocusBlock)顶部
              lines.y.push({ top: t + h, showTop: t + h }) //              顶部 对齐 底部
              lines.y.push({ top: t + h / 2 - height / 2, showTop: t + h / 2 }) //              中间 对齐 中间（Y轴）
              lines.y.push({ top: t - height, showTop: t }) //              底部 对齐 顶部
              lines.y.push({ top: t + h - height, showTop: t + h }) //              底部 对齐 底部

              lines.x.push({ left: l, showLeft: l }) // (selectBlock)顶部 对齐 (unFocusBlock)顶部
              lines.x.push({ left: l + w, showLeft: l + w }) //              顶部 对齐 底部
              lines.x.push({ left: l + w / 2 - width / 2, showLeft: l + w / 2 }) //              中间 对齐 中间（x轴）
              lines.x.push({ left: l - width, showLeft: l }) //              底部 对齐 顶部
              lines.x.push({ left: l + w - width, showLeft: l + w }) //              底部 对齐 底部
            })
            return lines
          })(),
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
      }
      return {
        markState,
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
          xxState.selectBlock = block
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
            xxState.selectBlock = undefined
          }
        },
      },
    }))()

    /** 其它事件 */
    const handler = {
      onContextmenu: (e: MouseEvent, block: BlockData) => {
        e.stopPropagation()
        e.preventDefault()
        $$dropdown({
          reference: e,
          content: () => (
            <>
              <DropdownOptionItem label='置顶节点' icon='top' {...{ onClick: commander.placeTop }} />
              <DropdownOptionItem label='置底节点' icon='bottom' {...{ onClick: commander.placeBottom }} />
              <DropdownOptionItem label='删除节点' icon='delete' {...{ onClick: commander.delete }} />
              <DropdownOptionItem
                label='查看节点'
                icon='top-left'
                {...{ onClick: () => methods.showBlockData(block) }}
              />
              <DropdownOptionItem
                label='导入节点'
                icon='top-right'
                {...{ onClick: () => methods.importBlockData(block) }}
              />
            </>
          ),
        })
      },
    }

    const commander = useCommand({
      canvasDataModel: dataModel,
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
                        onContextmenu: (e: MouseEvent) => handler.onContextmenu(e, block),
                      }}
                    />
                  ))}
                {blockHandler.markState.y !== null && (
                  <div class='move-mark-line-y' style={{ top: `${blockHandler.markState.y}px` }} />
                )}
                {blockHandler.markState.x !== null && (
                  <div class='move-mark-line-x' style={{ left: `${blockHandler.markState.x}px` }} />
                )}
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
            <div>
              <EditorForm
                block={xxState.selectBlock}
                config={props.config}
                dataModel={dataModel}
                {...{
                  onUpdateBlock: (data: { newBlock: BlockData; oldBlock: BlockData }) => {
                    commander.updateBlock(data.newBlock, data.oldBlock)
                  },
                  onUpdateCanvas: (data: CanvasModelValue) => {
                    console.log('CanvasModelValue', data)
                    commander.updateCanvasModel(data)
                  },
                }}
              />
            </div>
          </aside>
        </section>
      </div>
    )
  },
})

export default EditorLayout
