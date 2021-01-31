import { reactive, onUnmounted } from 'vue'
import KeyboardCode from '@/utils/keyCodeMap'

export interface CommandExecute {
  undo?: () => void
  redo: () => void
}

export interface Command {
  name: string // 命令唯一标识
  keyboard?: string | string[] // 命令监听的快捷键
  execute: (...args: any[]) => CommandExecute // 命令执行时所触发的操作
  followQueue?: boolean // 是否存放到 操作历史队列 中
  init?: () => () => void | undefined // 命令初始化函数
  data?: any
}

// export interface CommandManager {
//   queue: CommandExecute[],
//   current: number
// }

export function createCommandManager() {
  const state = reactive({
    current: -1, // 队列中当前的命令
    queue: [] as CommandExecute[], // 命令操作队列
    commandArray: [] as Command[], // 命令对象数组
    commands: {} as Record<string, (...args: unknown[]) => void>, //  命令对象
    destroyList: [] as (() => void | undefined)[], // 销毁逻辑数组
  })
  const register = (command: Command) => {
    if (!state.commands[command.name]) {
      state.commandArray.push(command)
      state.commands[command.name] = (...args) => {
        const { undo, redo } = command.execute(...args)
        if (command.followQueue) {
          state.queue.push({ undo, redo })
          state.current += 1
        }
        redo()
        // eg: 点击删除，会执行删除命令中 execute 方法，并返回 undo, redo
        // 两个函数，并立即执行 redo 方法
      }
      // 当命令注册完成，执行命令中 init 进行初始化
      if (command.init) command.init()
    }
  }

  /**
   * @description 键盘监听事件
   */
  const keyboardEvent = (() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) {
        return
      }
      // metaKey 对于 mac 上 command
      const { shiftKey, ctrlKey, altKey, metaKey, keyCode } = e
      const targetKeys: string[] = []
      if (metaKey || ctrlKey) {
        targetKeys.push('ctrl')
      }
      if (altKey) {
        targetKeys.push('alt')
      }
      if (shiftKey) {
        targetKeys.push('shiftKey')
      }
      targetKeys.push(KeyboardCode[keyCode])
      const targetKeyStr = targetKeys.join('+')
      console.log('targetKeyStr', targetKeyStr, state.commandArray)

      state.commandArray.forEach(command => {
        const { keyboard, name } = command
        if (!keyboard) return
        const keys = (Array.isArray(keyboard) ? keyboard : [keyboard]).map(item => item.replace(/\s+/g, ''))
        if (keys.indexOf(targetKeyStr) > -1) {
          state.commands[name]() // 执行快捷键对应的 keyboard
          e.stopPropagation()
          e.preventDefault()
        }
      })
    }
    const init = () => {
      window.addEventListener('keydown', onKeydown)
      return () => window.removeEventListener('keydown', onKeydown)
    }
    return init
  })()

  /**
   * @description useCommander初始化函数，负责初始化键盘监听事件，调用命令的初始化逻辑
   */
  const init = () => {
    // const onKeyDown = (e: KeyboardEvent) => {
    //   console.log('监听到键盘 event 事件', e)
    // }
    // window.addEventListener('keydown', onKeyDown)
    state.commandArray.forEach(command => {
      if (command.init) {
        state.destroyList.push(command.init())
      }
    })
    state.destroyList.push(keyboardEvent())
    // state.destroyList.push(() => {
    //   window.removeEventListener('keydown', onKeyDown)
    // })
  }

  // 注册默认的命令：撤销 和 重做
  register({
    // 撤销
    name: 'undo',
    keyboard: 'ctrl+z',
    followQueue: false,
    execute: () => {
      // console.log('ctrl + z ing')
      return {
        redo() {
          // console.log('ctrl + z redo ing', state)
          const { current, queue } = state
          if (current === -1) return
          const { undo } = queue[current]
          if (undo) undo()
          state.current -= 1
        },
      }
    },
  })

  register({
    // 重做
    name: 'redo',
    keyboard: 'ctrl + shift + z',
    followQueue: false,
    execute: () => {
      // console.log('重做 ing', state)
      return {
        redo() {
          // console.log('重做 redo state', state)
          const { current, queue } = state
          const { redo } = queue[current + 1]
          // why current + 1, not current? 👆
          // 当执行 删除(current +1) -> 撤销 (current - 1), 此时 current = -1, queue = [{...}]
          // 所以在 重做命令时，需进行 +1 为 0, 才能读取 queue 中的值
          if (redo) {
            redo()
            state.current += 1
          }
        },
      }
    },
  })

  onUnmounted(() => {
    state.destroyList.forEach(fn => fn && fn())
  })

  return {
    state,
    register,
    init,
  }
}
