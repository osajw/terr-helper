import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import fr from 'vuetify/es5/locale/fr'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { fr }, // TODO: switch & date input, store local in localStorage
    current: 'fr'
  },
  icons: {
    iconfont: 'mdiSvg'
  },
  theme: {
    themes: {
      light: {
        primary: '#26B3B3',
        accent: '#F5C02B',
        secondary: '#29494F',
        success: '#4CAF50',
        info: '#26B3B3',
        warning: '#FB8C00',
        error: '#FF5252'
      },
      dark: {
        primary: '#26B3B3',
        accent: '#F5C02B',
        secondary: '#29494F',
        success: '#4CAF50',
        info: '#26B3B3',
        warning: '#FB8C00',
        error: '#FF5252'
      }
    },
    options: { customProperties: true }
  }
})
