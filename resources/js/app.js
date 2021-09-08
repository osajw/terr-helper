require('./bootstrap')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { dateHelper } from './components/mixins/dateHelper'
import { urlHelper } from './components/mixins/urlHelper'

window.Vue = Vue
Vue.mixin(dateHelper)
Vue.mixin(urlHelper)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
