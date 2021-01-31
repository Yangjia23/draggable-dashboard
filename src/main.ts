import { createApp } from 'vue'
import {
  ElButton,
  ElInput,
  ElRadio,
  ElSlider,
  ElSelect,
  ElOption,
  ElTooltip,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElColorPicker,
} from 'element-plus'

import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.component(ElButton.name, ElButton)
app.component(ElInput.name, ElInput)
app.component(ElRadio.name, ElRadio)
app.component(ElSlider.name, ElSlider)
app.component(ElSelect.name, ElSelect)
app.component(ElOption.name, ElOption)
app.component(ElTooltip.name, ElTooltip)
app.component(ElDialog.name, ElDialog)
app.component(ElForm.name, ElForm)
app.component(ElFormItem.name, ElFormItem)
app.component(ElInputNumber.name, ElInputNumber)
app.component(ElColorPicker.name, ElColorPicker)

app.use(store)
app.use(router)
app.mount('#app')
