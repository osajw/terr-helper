<template>
  <v-dialog
    v-model="dialog"
    content-class="DialogWithdrawal"
    max-width="600px"
    transition="dialog-bottom-transition"
    fullscreen hide-overlay
  >
    <v-card>
      <v-toolbar color="primary" dense dark>
        <v-btn icon dark @click="dialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>{{ terrName }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-form ref="form" class="BasicForm" v-model="valid" lazy-validation>
            <v-autocomplete
              v-model="form.peopleId"
              :items="[{ add: true }, ...sortedPeoples]"
              :rules="peopleRules"
              :item-text="getPeoleName"
              label="Sorti par :"
              item-value="id"
            >
              <template v-slot:selection="data">
                <span>{{ data.item.firstname }} {{ data.item.lastname }}</span>
              </template>
              <template v-slot:item="data">
                <v-list-item-content @click="data.item.add ? (editPeopleId = (showDialogPeople = true) && 'new') : 0">
                  <v-list-item-title>
                    <span v-if="!data.item.add">{{ data.item.firstname }} {{ data.item.lastname }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-icon v-if="data.item.add">{{ mdiPlus }}</v-icon>
                    {{ data.item.add ? 'Ajouter une personne' : data.item.email || data.item.phone }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="!data.item.add">
                  <v-icon small @click.stop="showDialogPeople = true; editPeopleId = data.item.id">{{ mdiPencil }}</v-icon>
                </v-list-item-action>
              </template>
            </v-autocomplete>
            <DialogPickerDialog v-model="form.outAt" label="Date de sortie :" />
            <DialogPickerDialog v-model="form.inAt" label="Date de rentrée :" />
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" class="mr-4" text @click="rm">Supprimer</v-btn>
        <v-spacer />
        <v-btn color="warning" text @click="close">Annuler</v-btn>
        <v-btn :disabled="!valid" color="success" class="mr-4" elevation="0" @click="save">Enregistrer</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="showDialogPrint" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">
          Envoyer le pdf ?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="base darken-1" text @click="close">
            Non
          </v-btn>
          <v-btn color="base darken-1" text @click="sendPdf">
            Oui
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DialogPeople :id="editPeopleId" :visibility.sync="showDialogPeople" @input="v => form.peopleId = v.id" />
  </v-dialog>
</template>

<script>
import { mdiClose, mdiPlus, mdiPencil } from '@mdi/js'
import { mapGetters } from 'vuex'
import DialogPickerDialog from './DatePickerDialog'
import DialogPeople from './DialogPeople'
import { printTerr } from '../utilities/print'

export default {
  name: 'DialogWithdrawal',
  components: {
    DialogPickerDialog, DialogPeople
  },
  props: {
    id: {
      type: String,
      required: true
    },
    visibility: {
      type: Boolean,
      required: true
    },
    territoryId: {
      type: String,
      default: ''
    },
    setIn: {
      type: Boolean,
      default: false
    },
    setOut: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      mdiClose,
      mdiPlus,
      mdiPencil,
      form: {},
      valid: false,
      peopleRules: [v => !!v || 'Champ obligatoire'],
      showDialogPrint: false,
      showDialogPeople: false,
      editPeopleId: ''
    }
  },
  computed: {
    ...mapGetters(['territories', 'peoples', 'withdrawals', 'territoriesWithInfos']),
    sortedPeoples () {
      return [...this.peoples].sort((a, b) => this.getPeoleName(a).localeCompare(this.getPeoleName(b)))
    },
    dialog: {
      get () {
        return this.visibility
      },
      set (v) {
        this.$emit('update:visibility', v)
      }
    },
    peopleById () {
      return this.peoples.reduce((obj, p) => {
        obj[p.id] = p
        return obj
      }, {})
    },
    peoplesId () {
      return this.peoples.map(p => p.id)
    },
    terr () {
      if (!this.territoryId) { return {} }
      return this.territoriesWithInfos.find(t => t.id === this.territoryId) || {}
    },
    terrName () {
      return this.territoryId ? this.terr.name || '??' : ''
    },
    currentPeople () {
      if (!this.form.peopleId) { return {} }
      return (this.peoples.find(p => p.id === this.form.peopleId) || {})
    },
    navShare () {
      return navigator.share
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
      this.$store.dispatch(`${this.id === 'new' ? 'create' : 'update'}Data`, { name: 'withdrawals', data: this.form })
      if (this.navShare && this.setOut) { // when out
        this.showDialogPrint = true
      } else { this.close() }
    },
    close () {
      this.showDialogPrint = false
      this.showDialogPeople = false
      this.dialog = false
    },
    rm () {
      this.$store.dispatch('deleteData', { name: 'withdrawals', id: this.id })
      this.close()
    },
    getForm () {
      if (this.id === 'new') {
        this.form = { territoryId: this.territoryId }
      } else {
        this.form = { ...this.withdrawals.find(el => el.id === this.id) || {} }
      }
      if (this.setIn) {
        this.form.inAt = new Date().toISOString().substr(0, 10)
      }
      if (this.setOut) {
        this.form.outAt = new Date().toISOString().substr(0, 10)
      }
    },
    getPeoleName (people) {
      return `${people.firstname} ${people.lastname}`
    },
    async sendPdf () {
      printTerr(this.terr, this.currentPeople)
      this.close()
    }
  }
}
</script>

<style lang="scss">
.DialogWithdrawal {
  .v-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    &__text {
      padding-top: 14px;
    }
    &__actions {
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  }
}
</style>
