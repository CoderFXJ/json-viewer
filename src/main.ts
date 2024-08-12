import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { setupI18n } from './utils'
import './main.scss'

// Tailwind 紧凑型样式重置
import 'virtual:uno.css'
import './assets/iconfont/iconfont.css'
import '@unocss/reset/tailwind-compat.css'
import 'splitpanes/dist/splitpanes.css'
// 引入pinia
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'

// 创建pinia实例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
setupI18n(app)
app.use(pinia)
app.mount('#app')
