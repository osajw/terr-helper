import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import i18n from './plugins/i18n'

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
      title: i18n.t('territory.plural'),
      auth: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import(/* webpackChunkName: "History" */ './views/History.vue'),
    meta: {
      title: i18n.t('history.label'),
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
    if (!store.state.token) {
      next({ path: '/password' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.noAuth)) {
    if (store.state.token) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
