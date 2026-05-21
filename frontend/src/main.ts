import '@/assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { i18n } from '@/plugins/i18n'
import { pb } from '@/services/pocketbase'

import App from './App.vue'
import router from './router'

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')

pb.authStore.onChange(() => {
  if (!pb.authStore.isValid && router.currentRoute.value.meta.requiresAuth) {
    router.push('/')
  }
})
