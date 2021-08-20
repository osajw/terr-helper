import { AES, enc } from 'crypto-js'

const toCrypt = ['name', 'desc', 'imageUrl', 'firstname', 'lastname', 'email', 'phone', 'address', 'planUrl']

export function encryptObj (obj, password) {
  Object.keys(obj)
    .filter(k => toCrypt.includes(k) && obj[k])
    .forEach(key => (obj[key] = AES.encrypt(obj[key], password).toString()))
  return obj
}

export function decryptObj (obj, password) {
  Object.keys(obj)
    .filter(k => toCrypt.includes(k) && obj[k])
    .forEach(key => (obj[key] = AES.decrypt(obj[key], password).toString(enc.Utf8)))
  return obj
}
