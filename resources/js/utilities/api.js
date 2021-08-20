export default class API {
  static getAll () {
    return new Promise((resolve, reject) => {
      console.log('getAll')
      resolve([])
    })
  }

  static get (name) {
    return new Promise((resolve, reject) => {
      console.log('get', name)
      resolve(null)
    })
  }

  static add (name, data, noUpdateAt) {
    if (!noUpdateAt) {
      data = { ...data, updateAt: new Date().toISOString() }
    }
    return new Promise((resolve, reject) => {
      console.log('add', name, data)
      resolve(null)
    })
  }

  static update (name, data, noUpdateAt) {
    if (!noUpdateAt) {
      data = { ...data, updateAt: new Date().toISOString() }
    }
    return new Promise((resolve, reject) => {
      console.log('update', name, data)
      resolve(null)
    })
  }

  static remove (name, id) {
    return new Promise((resolve, reject) => {
      console.log('remove', id)
      resolve(null)
    })
  }
}
