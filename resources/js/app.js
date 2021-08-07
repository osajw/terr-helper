require('./bootstrap');

import Vue from 'vue'
window.Vue = Vue
import App from './App.vue'
import router from './router'
import store from './store'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
