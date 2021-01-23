import { createApp } from 'vue'
import { ElButton, ElSelect } from 'element-plus'

import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.component(ElButton.name, ElButton)
app.component(ElSelect.name, ElSelect)

app.use(store)
app.use(router)
app.mount('#app')
