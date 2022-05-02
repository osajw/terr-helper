<template>
  <v-dialog
    v-model="dialog"
    content-class="DialogTerritory"
    max-width="600px"
    transition="dialog-bottom-transition"
    fullscreen hide-overlay
  >
    <v-card>
      <v-toolbar color="primary" dense dark>
        <v-btn icon dark @click="dialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>{{ $t(`territory.${id == 'new' ? 'create' : 'edit'}`)  }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-form ref="form" class="BasicForm mb-4" v-model="valid" lazy-validation>
            <v-text-field v-model="form.name" :rules="nameRules" :label="$tcolon('form.name')" required />
            <v-textarea v-model="form.desc" :label="$tcolon('form.description')" rows="2" auto-grow />
            <v-slider v-model="form.difficulty" :label="$tcolon('form.difficulty')" :max="10" class="align-center">
              <template v-slot:append>
                <v-text-field :value="form.difficulty" class="mt-0 pt-0" type="number" style="width: 60px" readonly />
              </template>
            </v-slider>
            <v-btn v-if="errorImage && form.name" elevation="0" style="width: 100%;" @click="uploadFile"><v-icon left dark>{{ mdiCloudUpload }}</v-icon> {{ $t('territory.addImage') }}</v-btn>
          </v-form>
          <h4>{{ $tcolon('territory.doNotVisitLong') }}</h4>
          <div v-if="!hideNpv" class="npvs">
            <v-card v-for="npv in terrNpvs" :key="npv.id" class="npv" outlined flat>
              <v-card-title>
                <span>{{ $formatDate(npv.date) }}</span>
                <v-btn icon @click="editNpv(npv.id)">
                  <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <p>{{ npv.address }}</p>
              </v-card-text>
              <v-img v-if="npv.planUrl" :src="$npvUrl(npv.planUrl)" />
            </v-card>
            <v-btn class="add-npv" depressed @click="createNpv"><v-icon left dark>{{ mdiAccountPlus }}</v-icon> {{ $t('form.add') }}</v-btn>
          </div>
        </v-container>
      </v-card-text>
      <div v-if="!errorImage" class="img-wrapper mx-auto">
        <img :src="$terrUrl(form.name)" style="width: 100%;height: 100%; object-fit: cover;" @error="errorImage = true" />
        <v-btn fab dark color="warning" @click="uploadFile"><v-icon>{{ mdiSwapHorizontal }}</v-icon></v-btn>
      </div>
      <v-virtual-scroll :bench="1" :items="history" :height="history.length > 3 ? 200 : history.length * 64 + 32" item-height="64">
        <template v-slot:default="{ item }">
          <v-list-item :key="item.id">
            <v-list-item-content>
              <v-list-item-title><v-icon>{{ mdiAccount }}</v-icon> {{ peopleName(item.peopleId) }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-icon v-if="item.outAt || item.inAt">{{ mdiCalendar }}</v-icon>
                <span v-if="item.outAt"> {{ $formatDate(item.outAt) }} - </span>
                <span v-if="item.inAt">{{ $formatDate(item.inAt) }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon small @click="showDialogWithdrawal = true; editWithdrawalId = item.id">{{ mdiPencil }}</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </template>
      </v-virtual-scroll>
      <v-card-actions>
        <v-btn color="error" class="mr-4" text @click="rm">{{ $t('form.delete') }}</v-btn>
        <v-spacer />
        <v-btn color="warning" text @click="close">{{ $t('form.cancel') }}</v-btn>
        <v-btn :disabled="!valid" color="success" class="mr-4" elevation="0" @click="save">{{ $t('form.save') }}</v-btn>
      </v-card-actions>
    </v-card>
    <DialogNpv :visibility.sync="showDialogNpv" :data="npvForm" @update="getNpvUpdate" />
    <DialogWithdrawal :visibility.sync="showDialogWithdrawal" :id="editWithdrawalId" :territoryId="id" />
  </v-dialog>
</template>

<script>
import { mdiClose, mdiPencil, mdiAccount, mdiCalendar, mdiCloudUpload, mdiAccountPlus, mdiSwapHorizontal } from '@mdi/js'
import { mapGetters } from 'vuex'
import DialogNpv from './DialogNpv'
import DialogWithdrawal from './DialogWithdrawal'

export default {
  name: 'DialogTerritory',
  components: {
    DialogNpv, DialogWithdrawal
  },
  props: {
    id: {
      type: String,
      required: true
    },
    visibility: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      mdiClose,
      mdiPencil,
      mdiAccount,
      mdiCalendar,
      mdiCloudUpload,
      mdiAccountPlus,
      mdiSwapHorizontal,
      form: {},
      nameRules: [
        v => !!v || this.$t('form.nameRequired'),
        v => (v && v.length >= 2) || this.$t('form.nameTooSmall')
      ],
      valid: false,
      showDialogNpv: false,
      npvForm: {},
      hideNpv: false,
      npvsToUpdate: [],
      showDialogWithdrawal: false,
      errorImage: false,
      uploadFileError: '',
      editWithdrawalId: ''
    }
  },
  computed: {
    ...mapGetters(['territories', 'npvs', 'peoples', 'withdrawals']),
    dialog: {
      get () {
        return this.visibility
      },
      set (v) {
        this.$emit('update:visibility', v)
      }
    },
    terrNpvs () {
      if (this.id === 'new') { return this.npvsToUpdate }
      const updatedIds = this.npvsToUpdate.map(n => n.id)
      return this.npvsToUpdate.filter(n => !n.deleted).concat(
        this.npvs.filter(n => n.territoryId === this.id && !updatedIds.includes(n.id)))
    },
    history () {
      return [...this.withdrawals.filter(w => w.territoryId === this.id)].sort((a, b) => {
        const tA = new Date(a.inAt || a.outAt)
        const tB = new Date(b.inAt || b.outAt)
        return tB.getTime() - tA.getTime()
      })
    }
  },
  mounted () {
    this.getForm()
  },
  watch: {
    visibility () {
      this.$nextTick(() => this.$refs.form.resetValidation())
      this.getForm()
    }
  },
  methods: {
    async save () {
      this.$refs.form.validate()
      await new Promise((resolve) => this.$nextTick(resolve))
      if (!this.valid) { return }
      this.$store.dispatch(`${this.id === 'new' ? 'create' : 'update'}Data`, { name: 'territories', data: this.form })
        .then((terr) => this.updateNpvs(terr.id))
      this.close()
    },
    close () {
      this.dialog = false
      this.form = {}
    },
    rm () {
      this.$store.dispatch('deleteData', { name: 'territories', id: this.id })
      this.close()
    },
    getForm () {
      this.errorImage = false
      if (this.visibility) { this.npvsToUpdate = [] } // reset npv updated
      if (this.id === 'new') {
        this.form = { difficulty: 5 }
      } else {
        this.form = { ...this.territories.find(t => t.id === this.id) || {} }
      }
    },
    createNpv () {
      this.npvForm = { id: `new_${Math.random().toString(36).substr(2, 9)}` }
      this.showDialogNpv = true
    },
    editNpv (id) {
      const npv = this.terrNpvs.find(t => t.id === id)
      if (npv) {
        this.npvForm = npv
        this.showDialogNpv = true
      }
    },
    getNpvUpdate (npv) {
      const i = this.npvsToUpdate.findIndex(n => n.id === npv.id)
      if (i !== -1) {
        this.npvsToUpdate.splice(i, 1)
      }
      if (npv.id.slice(0, 3) !== 'new' || !npv.deleted) {
        this.npvsToUpdate.push(npv)
      }
      this.hideNpv = true
      this.$nextTick(() => (this.hideNpv = false)) // in order to reload img
    },
    updateNpvs (territoryId) {
      this.npvsToUpdate.forEach(npv => {
        if (npv.deleted) { // delete
          this.$store.dispatch('deleteData', { name: 'npvs', id: npv.id })
        } else if (npv.id.slice(0, 3) === 'new') { // create
          npv.territoryId = territoryId
          delete npv.id
          this.$store.dispatch('createData', { name: 'npvs', data: npv })
        } else { // update
          this.$store.dispatch('updateData', { name: 'npvs', data: npv })
        }
      })
    },
    uploadFile () {
      this.uploadFileError = ''
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.jpg,.jpeg,.png,.bmp,.gif'
      input.onchange = e => { 
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', `${this.form.name}.jpg`)
        this.$store.dispatch('upload', formData)
          .then(() => {
            this.errorImage = true
            this.$nextTick(() => (this.errorImage = false))
          })
          .catch((err) => {
            let data = err?.response?.data || {}
            if (typeof data === 'string') { data = JSON.parse(data) }
            let msg = data?.error || data?.file || data?.name
            if (Array.isArray(msg)) { msg = msg.join(', ')}
            this.uploadFileError = this.$t(`error.occurred${msg ? 'WithMsg' : ''}`, { msg })
          })
      }
      input.click()
    },
    peopleName (id) {
      const people = this.peoples.find(p => p.id === id)
      return people ? `${people.firstname} ${people.lastname}` : this.$t('territory.peopleDeleted')
    }
  }
}
</script>

<style lang="scss">
.DialogTerritory {
  .v-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    &__text {
      padding-top: 14px;
      padding-bottom: 0 !important;
    }
    &__actions {
      flex-wrap: wrap;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .img-wrapper {
      position: relative;
      max-width: 900px;
      max-height: 900px;
      .v-btn {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
    .npv {
      .v-card__title {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 24px;
        padding-bottom: 4px;
        font-size: 14px;
        > span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .v-btn {
          width: 28px;
          height: 28px;
        }
        .v-icon__svg {
          width: 20px;
          height: 20px;
        }
      }
      .v-card__text {
        padding-top: 4px;
      }
      + .npv {
        margin-top: 10px;
      }
    }
    .add-npv {
      width: 100%;
      margin-top: 10px;
    }
  }
}
</style>
