import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/main.css'
import { i18n } from '@/plugins/i18n'
import { pb } from '@/services/pocketbase'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .mount('#app')

pb.authStore.onChange(() => {
  if (!pb.authStore.isValid && router.currentRoute.value.meta.requiresAuth) {
    router.push('/')
  }
})


