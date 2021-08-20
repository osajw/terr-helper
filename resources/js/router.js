import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/territory'
  },
  {
    path: '/territory',
    name: 'Territory',
    component: () => import(/* webpackChunkName: "Territory" */ './views/Territory.vue'),
    meta: {
      title: 'Territoires',
      auth: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import(/* webpackChunkName: "History" */ './views/History.vue'),
    meta: {
      title: 'Historique',
      auth: true
    }
  },
  {
    path: '/password',
    name: 'password',
    component: () => import(/* webpackChunkName: "Password" */ './views/Password.vue'),
    meta: {
      noAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    if (!store.state.password) {
      next({ path: '/password' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.noAuth)) {
    if (store.state.password) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
