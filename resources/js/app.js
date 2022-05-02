require('./bootstrap')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'
import { dateHelper } from './components/mixins/dateHelper'
import { urlHelper } from './components/mixins/urlHelper'
import { i18nHelper } from './components/mixins/i18nHelper'

window.Vue = Vue
Vue.mixin(dateHelper)
Vue.mixin(urlHelper)
Vue.mixin(i18nHelper)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
