require('./bootstrap');

import Vue from 'vue'
window.Vue = Vue
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
