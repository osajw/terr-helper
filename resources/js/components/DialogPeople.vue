<template>
  <v-dialog
    v-model="dialog"
    content-class="DialogPeople"
    max-width="600px"
    transition="dialog-bottom-transition"
    fullscreen hide-overlay
  >
    <v-card>
      <v-toolbar color="primary" dense dark>
        <v-btn icon dark @click="dialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>{{ id == 'new' ? 'Créer' : 'Modifier' }} une personne</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-form ref="form" class="BasicForm" v-model="valid" lazy-validation>
            <v-text-field v-model="form.firstname" :rules="firstnameRules" label="Prénom :" required />
            <v-text-field v-model="form.lastname" :rules="lastnameRules" label="Nom de famille :" required />
            <v-text-field v-model="form.email" :rules="emailRules" label="Adresse e-mail :"  />
            <v-text-field v-model="form.phone" :rules="phoneRules" label="Numéro de téléphone :"  />
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
  </v-dialog>
</template>

<script>
import { mdiClose } from '@mdi/js'
import { mapGetters } from 'vuex'

export default {
  name: 'DialogPeople',
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
      form: {},
      firstnameRules: [
        v => !!v || 'Prénom obligatoire',
        v => (v && v.length >= 2) || 'Prénom trop petit'
      ],
      lastnameRules: [
        v => !!v || 'Nom de famille obligatoire',
        v => (v && v.length >= 2) || 'Nom trop petit'
      ],
      emailRules: [],
      phoneRules: [],
      valid: false
    }
  },
  computed: {
    ...mapGetters(['peoples']),
    dialog: {
      get () {
        return this.visibility
      },
      set (v) {
        this.$emit('update:visibility', v)
      }
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
      this.$store.dispatch(`${this.id === 'new' ? 'create' : 'update'}Data`, { name: 'peoples', data: this.form })
        .then((people) => this.$emit('input', people))
      this.close(false)
    },
    close (emit = true) {
      this.dialog = false
      if (emit) {
        this.$emit('input', {})
      }
    },
    rm () {
      this.$store.dispatch('deleteData', { name: 'peoples', id: this.id })
      this.close()
    },
    getForm () {
      if (this.id === 'new') {
        this.form = { territoryId: this.territoryId }
      } else {
        this.form = { ...this.peoples.find(el => el.id === this.id) || {} }
      }
    }
  }
}
</script>

<style lang="scss">
.DialogPeople {
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
