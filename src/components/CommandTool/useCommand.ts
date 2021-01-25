import { BlockData } from '@/utils/types'
import { createCommandManager } from './commandManager'

export default function useCommand({
  blockData,
  updateBlocks,
}: {
  blockData: {
    value: {
      focus: BlockData[]
      unFocus: BlockData[]
    }
  }
  updateBlocks: (blocks: BlockData[]) => void
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
        before: [...blockData.value.unFocus, ...blockData.value.focus],
        after: blockData.value.unFocus,
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

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
  }
}
