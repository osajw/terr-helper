const doRequest = (type, token, id, method = 'GET') => {
  const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)
  return fetch(`/api/${type}${id ? `/${id}` : ''}`, { method, headers })
    .then(res => res.json())
}
export default class API {
  static getAll (type, token) {
    return doRequest(type, token)
  }

  static get (type, id, token) {
    return doRequest(type, token, id)
  }

  static add (type, data, noUpdateAt, token) {
    if (!noUpdateAt) {
      data = { ...data, updateAt: new Date().toISOString() }
    }
    return new Promise((resolve, reject) => {
      console.log('add', type, data)
      resolve(null)
    })
  }

  static update (type, data, noUpdateAt, token) {
    if (!noUpdateAt) {
      data = { ...data, updateAt: new Date().toISOString() }
    }
    return new Promise((resolve, reject) => {
      console.log('update', type, data)
      resolve(null)
    })
  }

  static remove (type, id, token) {
    return new Promise((resolve, reject) => {
      console.log('remove', id)
      resolve(null)
    })
  }
}
