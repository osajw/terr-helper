import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { messages } from '../lang'

Vue.use(VueI18n)

const locale = localStorage.getItem('lang') || navigator.language.split('-')[0]

const i18n = new VueI18n({
  fallbackLocale: 'fr',
  locale,
  messages,
  silentFallbackWarn: true
})

export default i18n
