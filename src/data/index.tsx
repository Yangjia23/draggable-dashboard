import { createComponentHandler } from '@/utils/editor'
import componentMap from './components'

const registerCompMap = createComponentHandler()

Object.keys(componentMap).forEach((key: string) => {
  const componentConfig = componentMap[key]
  // 注册 component
  registerCompMap.register(key, componentConfig)
})

export default registerCompMap
