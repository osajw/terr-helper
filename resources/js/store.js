import Vue from 'vue'
import Vuex from 'vuex'
import i18n from './plugins/i18n'
import { printS13 } from './utilities/print'
import { encryptObj, decryptObj } from './utilities/crypt'
import axios from 'axios'
const dateHelper = require('./components/mixins/dateHelper').dateHelper.methods

Vue.use(Vuex)

function openFile (accept) {
  let changed = false
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = e => {
      changed = true
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', (event) => {
        const result = event.target.result
        let json = null
        try {
          json = JSON.parse(result)
          resolve(json)
        } catch (error) {
          alert(i18n.t('error.providValidJson'))
          resolve(null)
        }
      })
      reader.readAsText(file, 'UTF-8')
    }
    window.addEventListener('focus', () => { // cancel
      setTimeout(() => changed ? null : resolve(null), 300)
    }, { once: true })
    input.click()
  })
}

const api = (type, token, id, method = 'GET', data = {}) => {
  return axios({
    url: `/api/${type}${id ? `/${id}` : ''}`,
    data,
    headers: token ? { 'Authorization': `Bearer ${token}` } : null,
    method
  }).then(({ data }) => {
    if ((data || {}).status === 'Token is Expired') {
      alert()
      window.location.reload(i18n.t('error.sessionExpired'))
    }
    return data
  })
}

export default new Vuex.Store({
  state: {
    token: '',
    preferences: {},
    territories: [],
    peoples: [],
    withdrawals: [],
    npvs: []
  },
  mutations: {
    SET_DATA (state, { name, data }) {
      state[name] = data
    },
    ADD_DATA (state, { name, data }) {
      state[name].push(data)
    },
    UPDATE_DATA (state, { name, data, upsert }) {
      const index = state[name].findIndex(e => e.id === data.id)
      // eslint-disable-next-line no-console
      if (index === -1) {
        if (upsert) { return state[name].push(data) }
        return console.error(`UPDATE_DATA : ${name}#${data.id} not found`)
      }
      state[name].splice(index, 1, data)
    },
    DELETE_DATA_BY_ID (state, { name, id }) {
      const index = state[name].findIndex(e => e.id === id)
      // eslint-disable-next-line no-console
      if (index === -1) { return console.error(`DELETE_DATA_BY_ID : ${name}#${id} not found`) }
      state[name].splice(index, 1)
    }
  },
  actions: {
    fetchAll ({ commit, state }) {
      const dbs = ['territories', 'peoples', 'withdrawals', 'npvs']
      const proms = []
      dbs.forEach(name => proms.push(api(name, state.token)
        .then(data => commit('SET_DATA', { name, data }))))
      return Promise.all(proms)
    },
    fetchPref ({ commit }) {
      const data = JSON.parse(localStorage.getItem('prefs') || '{}')
      commit('SET_DATA', { name: 'preferences', data })
      return Promise.resolve(data)
    },
    createData ({ commit, state }, { name, data }) {
      return api(name, state.token, '', 'POST', data).then((data) => {
        commit('ADD_DATA', { name, data })
        return data
      })
    },
    updateData ({ commit, state }, { name, data }) {
      return api(name, state.token, data.id, 'PUT', data).then((data) => {
        commit('UPDATE_DATA', { name, data })
        return data
      })
    },
    deleteData ({ commit, state, dispatch }, { name, id }) {
      return api(name, state.token, id, 'DELETE').then((data) => {
        commit('DELETE_DATA_BY_ID', { name, id })
        dispatch('cascadeDelete', { name, id })
        return null
      })
    },
    cascadeDelete ({ state, commit }, { name, id }) {
      if (name === 'territories') {
        state.npvs.forEach((npv) => {
          if (npv.territoryId === id) {
            commit('DELETE_DATA_BY_ID', { name: 'npvs', id: npv.id })
          }
        })
        state.withdrawals.forEach((withdrawal) => {
          if (withdrawal.territoryId === id) {
            commit('DELETE_DATA_BY_ID', { name: 'withdrawals', id: withdrawal.id })
          }
        })
      }
    },
    createPassword ({ commit, dispatch }, password) {
      return axios.post('/api/register', { password })
        .then(({ data }) => {
          commit('SET_DATA', { name: 'token', data: data.token })
          dispatch('fetchAll')
          return data
        })
    },
    checkPassword ({ commit, dispatch }, password) {
      return axios.post('/api/login', { password })
        .then(({ data }) => {
          commit('SET_DATA', { name: 'token', data: data.token })
          dispatch('fetchAll')
          return data
        })
    },
    needCreatePassword () {
      return api('nuser')
    },
    export ({ state }, { format, password }) {
      if (format === 's13') {
        printS13(state)
      } else if (format === 'json') {
        const json = {}
        const fields = ['territories', 'peoples', 'withdrawals', 'npvs']
        fields.forEach((field) => {
          json[field] = []
          state[field].forEach((obj) => {
            json[field].push(password ? encryptObj({ ...obj }, password) : obj)
          })
        })
        json.exportAt = new Date()

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', dataStr)
        downloadAnchorNode.setAttribute('download', i18n.t('file.territoriesJson'))
        document.body.appendChild(downloadAnchorNode) // required for firefox
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
      }
      return Promise.resolve()
    },
    async import ({ state, commit }, openPasswordDialog) {
      const json = await openFile('.json')
      if (!json) { return [] }
      const password = await openPasswordDialog()
      const types = ['territories', 'peoples', 'withdrawals', 'npvs']
      if (password) { // decrypt data
        types.forEach((type) => {
          json[type] = json[type].map(el => decryptObj(el, password))
        })
      }
      const data = await api('import', state.token, '', 'POST', json)
      types.forEach(name => data.out[name].forEach(data =>
        commit('UPDATE_DATA', { name, data, upsert: true }) ))
      return data.needUserCheck || []
    },
    setPref ({ commit, state }, { key, val }) {
      const data = { ...state.preferences, [key]: val }
      localStorage.setItem('prefs', JSON.stringify(data))
      commit('SET_DATA', { name: 'preferences', data })
      return Promise.resolve(data)
    },
    upload ({ state }, data) {
      return api('upload', state.token, '', 'POST', data)
    }
  },
  getters: {
    withdrawalsByTerrId: (state) => {
      return state.withdrawals.reduce((obj, w) => {
        if (w.deleted_at) { return obj } // not deleted
        if (!obj[w.territoryId]) { obj[w.territoryId] = [] }
        obj[w.territoryId].push(w)
        return obj
      }, {})
    },
    npvsByTerrId: (state) => {
      return state.npvs.reduce((obj, n) => {
        if (n.deleted_at) { return obj } // not deleted
        if (!obj[n.territoryId]) { obj[n.territoryId] = [] }
        obj[n.territoryId].push(n)
        return obj
      }, {})
    },
    territoriesWithInfos: (state, getters) => {
      const today = new Date()
      return state.territories.map((t) => {
        const withdrawals = getters.withdrawalsByTerrId[t.id] || []
        withdrawals.sort((a, b) => {
          const tA = new Date(a.inAt || a.outAt)
          const tB = new Date(b.inAt || b.outAt)
          return tA.getTime() - tB.getTime()
        })
        const last = withdrawals.slice(-1)[0]
        const lastUpdate = last ? new Date(last.updated_at) : null
        const updateAt = new Date(t.updated_at)
        const npvs = getters.npvsByTerrId[t.id] || []
        const daysIn = last && last.inAt ? dateHelper.$dateDaysDiff(new Date(last.inAt), today) : 0
        const daysOut = last && last.outAt ? dateHelper.$dateDaysDiff(new Date(last.outAt), today) : 0
        return {
          ...t,
          lastUpdate: (lastUpdate && lastUpdate > updateAt) ? updateAt : lastUpdate,
          inAt: last ? last.inAt : null,
          outAt: last ? last.outAt : null,
          daysIn,
          daysOut,
          by: last ? state.peoples.find(p => p.id === last.peopleId) : undefined,
          needOut: !withdrawals.length || (last.inAt && daysIn > 4 * 31),
          needIn: last ? !last.inAt && daysOut > 4 * 31 : false,
          withdrawals,
          npvs
        }
      })
    },
    territories: (state) => {
      return state.territories.filter(item => !item.deleted_at)
    },
    peoples: (state) => {
      return state.peoples.filter(item => !item.deleted_at)
    },
    withdrawals: (state) => {
      return state.withdrawals.filter(item => !item.deleted_at)
    },
    npvs: (state) => {
      return state.npvs.filter(item => !item.deleted_at)
    }
  },
  modules: {
  }
})
