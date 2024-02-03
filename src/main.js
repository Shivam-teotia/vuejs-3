import "./assets/style.scss"
import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
// import router from './router'
import { i18n } from "./locale/index.js";
const app = createApp(App)
app.use(i18n);
// app.use(createPinia())
// app.use(router)

app.mount('#app')
