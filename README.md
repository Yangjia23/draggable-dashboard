# draggable-dashboard

## 在线体验

## 开发环境及第三方依赖
- 开发环境
  - macOS 10.15.3
  - node "v14.2.0"
  - Visual Studio Code ": 1.45.0"

- 第三方依赖
  - element-plus: "^1.0.2-beta.28",
  - vue: "^3.0.0",
  - vue-router: "^4.0.0-0",
  - vuex: "^4.0.0-0"

## 本地运行
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 功能清单
  - [x] 项目初始化
  - [x] 注册左侧组件菜单
  - [x] 拖拽左侧组件到中间编辑画版
  - [x] 设置画版上组件选中，多选，取消选中等
  - [x] 在编辑画版上拖拽组件

### 大屏组件库
  - [x] 组件分类
  - [x] 组件注册模版，组件由组件模版来初始化
  - [ ] 定义组件 schema.json 文件，props 和 models
  - [ ] 添加组件采用异步获取组件的 JS、CSS、配置Schema


### 画布
  - [ ] 画布可缩放、利用 canvas 实现标尺、点击标尺出现辅助线  
  - [x] 画布上拖拽组件添加辅助线、吸附效果
  - [x] 设置组件层级（置顶、置底）
  - [ ] 画布大屏展示


## BugList
  - [x] 拖拽时，鼠标设置样式无效
  - [x] 画布上拖拽组件时，直接修改 computed 中属性，待修改
