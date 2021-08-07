import Vue from 'vue'
import Vuetify, {
  VApp,
  VMain,
  VBtn,
} from 'vuetify/lib'

Vue.use(Vuetify, {
  components: {
    VApp,
    VMain,
    VBtn
  }
})

const opts = {}

export default new Vuetify(opts)