import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/', name: 'home',
      component: () => import(/* webpackChunkName: "js/home" */ './views/Home.vue')
    }
  ]
})
