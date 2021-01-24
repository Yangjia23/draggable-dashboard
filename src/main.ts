import { createApp } from 'vue'
import { ElButton, ElInput, ElRadio } from 'element-plus'

import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.component(ElButton.name, ElButton)
app.component(ElInput.name, ElInput)
app.component(ElRadio.name, ElRadio)

app.use(store)
app.use(router)
app.mount('#app')
