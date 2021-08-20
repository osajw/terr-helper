import Vue from 'vue'
import Vuex from 'vuex'
import { printS13 } from './utilities/print'
import API from './utilities/api'
import { encryptObj, decryptObj } from './utilities/crypt'
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
          alert('Veuillez entrer un fichier .json valide !')
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

export default new Vuex.Store({
  state: {
    ready: true,
    preferences: [],
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
      return API.getAll().then((data) => {
        Object.keys(data).forEach(name => commit('SET_DATA', { name, data: data[name] }))
        return data
      })
    },
    fetchPref ({ commit, state }) {
      return API.get('preferences').then((data) => {
        commit('SET_DATA', { name: 'preferences', data })
        return state.preferences[0] || {}
      })
    },
    createData ({ commit }, { name, data, noUpdateAt }) {
      return API.add(name, data, noUpdateAt).then((data) => {
        commit('ADD_DATA', { name, data })
        return data
      })
    },
    updateData ({ commit }, { name, data, noUpdateAt }) {
      return API.update(name, data, noUpdateAt).then((data) => {
        commit('UPDATE_DATA', { name, data })
        return data
      })
    },
    deleteData ({ commit, dispatch }, { name, id }) {
      return API.remove(name, id).then((data) => {
        dispatch('cascadeDelete', { name, id })
        commit('DELETE_DATA_BY_ID', { name, id })
        return null
      })
    },
    cascadeDelete ({ state, commit }, { name, id }) {
      if (name === 'territories') {
        state.npvs.forEach((npv) => {
          if (npv.territoryId === id) {
            API.remove('npvs', npv.id)
            commit('DELETE_DATA_BY_ID', { name: 'npvs', id: npv.id })
          }
        })
        state.withdrawals.forEach((withdrawal) => {
          if (withdrawal.territoryId === id) {
            API.remove('withdrawals', withdrawal.id)
            commit('DELETE_DATA_BY_ID', { name: 'withdrawals', id: withdrawal.id })
          }
        })
      }
    },
    createPassword ({ commit, dispatch }, password) {
      return new Promise((resolve, reject) => {
        console.log('createPassword')
        resolve(true)
      })
    },
    checkPassword ({ state, commit, dispatch }, password) {
      return new Promise((resolve, reject) => {
        console.log('checkPassword')
        resolve(true)
      })
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
            json[field].push(encryptObj({ ...obj }, password))
          })
        })
        json.exportAt = new Date()

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', dataStr)
        downloadAnchorNode.setAttribute('download', 'territoires.json')
        document.body.appendChild(downloadAnchorNode) // required for firefox
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
      }
      return Promise.resolve()
    },
    async import ({ state, dispatch }, openPasswordDialog) {
      const json = await openFile('.json')
      if (!json) { return [] }
      const password = await openPasswordDialog()
      delete json.exportAt
      const promises = []
      const needUserCheck = []
      Object.keys(json).forEach((name) => {
        for (let i = 0; i < json[name].length; i++) {
          const data = decryptObj(json[name][i], password)
          const id = data.id
          if (!state[name]) { return } // bad property name
          const oldData = state[name].find(s => s.id === id)
          if (!oldData) {
            promises.push(dispatch('createData', { name, data, noUpdateAt: true }))
          } else if (new Date(data.updateAt) >= new Date(oldData.updateAt)) {
            promises.push(dispatch('updateData', { name, data, noUpdateAt: true }))
          } else {
            needUserCheck.push({ data, name })
          }
        }
      })
      await Promise.all(promises)
      return needUserCheck
    },
    setPref ({ commit, state }, { key, val }) {
      const data = { ...state.preferences[0], [key]: val }
      return new Promise((resolve, reject) => {
        console.log('setPref', data)
      })
    }
  },
  getters: {
    withdrawalsByTerrId: (state) => {
      return state.withdrawals.reduce((obj, w) => {
        if (!obj[w.territoryId]) { obj[w.territoryId] = [] }
        obj[w.territoryId].push(w)
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
        const lastUpdate = last ? new Date(last.updateAt) : null
        const updateAt = new Date(t.updateAt)
        const npvs = state.npvs.filter(n => n.territoryId === t.id)
        return {
          ...t,
          lastUpdate: (lastUpdate && lastUpdate > updateAt) ? updateAt : lastUpdate,
          inAt: last ? last.inAt : null,
          outAt: last ? last.outAt : null,
          by: last ? state.peoples.find(p => p.id === last.peopleId) : undefined,
          needOut: !withdrawals.length || (last.inAt && dateHelper.$dateDaysDiff(new Date(last.inAt), today) > 4 * 31),
          needIn: last ? !last.inAt && dateHelper.$dateDaysDiff(new Date(last.outAt), today) > 4 * 31 : false,
          withdrawals,
          npvs
        }
      })
    }
  },
  modules: {
  }
})
