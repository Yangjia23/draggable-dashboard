import deepcopy from 'deepcopy'
import { BlockData, CanvasModelValue } from '@/utils/types'
import { createCommandManager } from './commandManager'

export default function useCommand({
  blockDataModel,
  updateBlocks,
  dragStartEvent,
  dragEndEvent,
}: {
  blockDataModel: {
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
      console.log('执行删除操作ing')
      const data = {
        before: blockDataModel.value.blocks,
        after: blockDataModel.value.blocks.filter(block => !block.focus),
      }
      return {
        redo: () => {
          console.log('重新执行删除操作')
          updateBlocks(data.after)
        },
        undo: () => {
          console.log('撤回删除操作')
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
          this.data.before = deepcopy(blockDataModel.value.blocks || [])
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
      const after = blockDataModel.value.blocks || []

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
        before: deepcopy(blockDataModel.value.blocks || []),
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

  commander.init()

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    drag: () => commander.state.commands.drag(),
    clear: () => commander.state.commands.clear(),
  }
}
