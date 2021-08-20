<template>
  <v-dialog
    v-model="dialog"
    content-class="DialogNpv"
    max-width="600px"
    transition="dialog-bottom-transition"
    fullscreen hide-overlay
  >
    <v-card>
      <v-toolbar color="primary" dense dark>
        <v-btn icon dark @click="dialog = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title v-if="data.id">{{ data.id.slice(0, 3) == 'new' ? 'Créer' : 'Modifier' }} un npv</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-form ref="form" class="BasicForm" v-model="valid" lazy-validation>
            <DialogPickerDialog v-model="form.date" :rules="rulesDate" label="Date :" />
            <v-textarea v-model="form.address" label="Adresse :" rows="2" auto-grow />
            <v-text-field v-model="form.planUrl" label="Plan (URL ou Data-URI) :" clearable />
          </v-form>
        </v-container>
      </v-card-text>
      <v-img v-if="form.planUrl" :src="form.planUrl" />
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
import DialogPickerDialog from './DatePickerDialog'

export default {
  name: 'DialogNpv',
  components: {
    DialogPickerDialog
  },
  props: {
    data: {
      type: Object,
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
      rulesDate: [
        v => !!v || 'Date obligatoire'
      ],
      valid: false
    }
  },
  computed: {
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
      this.$emit('update', this.form)
      this.close()
    },
    close () {
      this.dialog = false
      this.form = {}
    },
    rm () {
      this.$emit('update', { deleted: true, id: this.data.id })
      this.close()
    },
    getForm () {
      this.form = JSON.parse(JSON.stringify(this.data))
    }
  }
}
</script>

<style lang="scss">
.DialogNpv {
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
  }
}
</style>
