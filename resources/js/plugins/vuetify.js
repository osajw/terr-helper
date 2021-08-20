import Vue from 'vue'
import Vuetify, {
  VApp,
  VMain,
  VBtn,
  VAppBar,
  VIcon,
  VExpandTransition,
  VAutocomplete,
  VInput,
  VCheckbox,
  VCard,
  VCardActions,
  VListItem,
  VListItemSubtitle,
  VListItemContent,
  VListItemTitle,
  VListItemAvatar
} from 'vuetify/lib'

Vue.use(Vuetify, {
  components: {
    VApp,
    VMain,
    VBtn,
    VAppBar,
    VIcon,
    VExpandTransition,
    VAutocomplete,
    VInput,
    VCheckbox,
    VCard,
    VCardActions,
    VListItem,
    VListItemSubtitle,
    VListItemContent,
    VListItemTitle,
    VListItemAvatar
  },
  icons: {
    iconfont: 'mdiSvg',
  }
})

const opts = {}

export default new Vuetify(opts)