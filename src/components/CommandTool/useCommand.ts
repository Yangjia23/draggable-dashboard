import deepcopy from 'deepcopy'
import { BlockData, CanvasModelValue } from '@/utils/types'
import { createCommandManager } from './commandManager'

export default function useCommand({
  canvasDataModel,
  updateBlocks,
  dragStartEvent,
  dragEndEvent,
}: {
  canvasDataModel: {
    value: CanvasModelValue
  }
  updateBlocks: (blocks: BlockData[]) => void
  dragStartEvent: {
    on: (cb: () => void) => void
    off: (cb: () => void) => void
  }
  dragEndEvent: {
    on: (cb: () => void) => void
    off: (cb: () => void) => void
  }
}) {
  const commander = createCommandManager()

  // 删除
  commander.register({
    name: 'delete',
    keyboard: ['delete', 'ctrl + d'],
    followQueue: true,
    execute: () => {
      // console.log('执行删除操作ing')
      const data = {
        before: canvasDataModel.value.blocks,
        after: canvasDataModel.value.blocks.filter(block => !block.focus),
      }
      return {
        redo: () => {
          // console.log('重新执行删除操作')
          updateBlocks(data.after)
        },
        undo: () => {
          // console.log('撤回删除操作')
          updateBlocks(data.before)
        },
      }
    },
  })

  // 拖拽
  commander.register({
    name: 'drag',
    followQueue: true,
    init() {
      this.data = { before: null as null | BlockData[] }
      const handler = {
        dragStart: () => {
          this.data.before = deepcopy(canvasDataModel.value.blocks || [])
        },
        dragEnd: () => {
          commander.state.commands.drag()
        },
      }
      dragStartEvent.on(handler.dragStart)
      dragEndEvent.on(handler.dragEnd)
      return () => {
        dragStartEvent.off(handler.dragStart)
        dragEndEvent.off(handler.dragEnd)
      }
    },
    execute() {
      const { before } = this.data
      const after = canvasDataModel.value.blocks || []

      return {
        redo: () => {
          updateBlocks(deepcopy(after))
        },
        undo: () => {
          updateBlocks(deepcopy(before))
        },
      }
    },
  })

  // 清空
  commander.register({
    name: 'clear',
    followQueue: true,
    execute() {
      const data = {
        before: deepcopy(canvasDataModel.value.blocks || []),
        after: [],
      }
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after))
        },
        undo: () => {
          updateBlocks(deepcopy(data.before))
        },
      }
    },
  })

  // 置顶
  commander.register({
    name: 'placeTop',
    keyboard: ['ctrl + up'],
    followQueue: true,
    execute() {
      const data = {
        before: deepcopy(canvasDataModel.value.blocks || []),
        after: deepcopy(
          (() => {
            const { blocks } = canvasDataModel.value
            const unFocusBlocks = blocks.filter(block => !block.focus)
            const maxZIndex = unFocusBlocks.reduce((pre, block) => Math.max(pre, block.zIndex), 0)
            blocks
              .filter(block => block.focus)
              .forEach(block => {
                block.zIndex = maxZIndex + 1
              })
            return deepcopy(canvasDataModel.value.blocks)
          })(),
        ),
      }
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after))
        },
        undo: () => {
          updateBlocks(deepcopy(data.before))
        },
      }
    },
  })

  // 置底
  commander.register({
    name: 'placeBottom',
    keyboard: ['ctrl + down'],
    followQueue: true,
    execute() {
      const data = {
        before: deepcopy(canvasDataModel.value.blocks || []),
        after: deepcopy(
          (() => {
            const { blocks } = canvasDataModel.value
            const unFocusBlocks = blocks.filter(block => !block.focus)
            let minZIndex = unFocusBlocks.reduce((pre, block) => Math.min(pre, block.zIndex), Infinity) - 1
            if (minZIndex < 0) {
              unFocusBlocks.forEach(block => {
                block.zIndex += Math.abs(minZIndex)
              })
              minZIndex = 0
            }
            blocks
              .filter(block => block.focus)
              .forEach(block => {
                block.zIndex = minZIndex
              })
            return deepcopy(canvasDataModel.value.blocks)
          })(),
        ),
      }
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after))
        },
        undo: () => {
          updateBlocks(deepcopy(data.before))
        },
      }
    },
  })

  // 更新单个 Block
  commander.register({
    name: 'updateBlock',
    followQueue: true,
    execute: (newBlock: BlockData, oldBlock: BlockData) => {
      console.log('newBlock', newBlock.props)
      console.log('oldBlock', oldBlock.props)
      const blocks = deepcopy(canvasDataModel.value.blocks || [])
      const data = {
        before: blocks,
        after: (() => {
          const idx = canvasDataModel.value.blocks!.indexOf(oldBlock)
          if (idx > -1) {
            blocks.splice(idx, 1, newBlock)
          }
          return deepcopy(blocks)
        })(),
      }
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after))
        },
        undo: () => {
          updateBlocks(deepcopy(data.before))
        },
      }
    },
  })

  // 更新canvas 容器
  commander.register({
    name: 'updateCanvasModel',
    followQueue: true,
    execute: (value: CanvasModelValue) => {
      console.log('value', value)
      const data = {
        before: deepcopy(canvasDataModel.value),
        after: deepcopy(value),
      }
      return {
        redo: () => {
          canvasDataModel.value = data.after
        },
        undo: () => {
          canvasDataModel.value = data.before
        },
      }
    },
  })

  commander.init()

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    drag: () => commander.state.commands.drag(),
    clear: () => commander.state.commands.clear(),
    placeTop: () => commander.state.commands.placeTop(),
    placeBottom: () => commander.state.commands.placeBottom(),
    updateBlock: (newBlock: BlockData, oldBlock: BlockData) => commander.state.commands.updateBlock(newBlock, oldBlock),
    updateCanvasModel: (value: CanvasModelValue) => commander.state.commands.updateCanvasModel(value),
  }
}
