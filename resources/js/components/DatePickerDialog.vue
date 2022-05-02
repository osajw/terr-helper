<template>
  <v-dialog ref="dialog" v-model="modal" :return-value.sync="date" persistent class="DialogPickerDialog" width="290px">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="dateFormatted"
        :label="label"
        :prepend-inner-icon="mdiCalendar"
        :rules="rules"
        readonly
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-date-picker v-model="date" :first-day-of-week="parseInt($t('firstDayOfWeek') || '1')" :locale="$i18n.locale" scrollable>
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="modal = false">{{ $t('form.cancel') }}</v-btn>
      <v-btn text color="primary" @click="$refs.dialog.save(date)">{{ $t('form.ok') }}</v-btn>
    </v-date-picker>
  </v-dialog>
</template>

<script>
import { mdiCalendar } from '@mdi/js'

export default {
  name: 'DialogPickerDialog',
  props: {
    value: {
      type: [String, Date],
      default: ''
    },
    label: {
      type: String,
      default: 'Date'
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      mdiCalendar,
      modal: false
    }
  },
  computed: {
    dateFormatted () {
      if (!this.date) return null
      const [yy, mm, dd] = this.date.split('-')
      return this.$t('date', { dd, mm, yy })
    },
    date: {
      get () { return this.value },
      set (v) { this.$emit('input', v) }
    }
  }
}
</script>

<style lang="scss">
// .DialogPickerDialog {
//   //
// }
</style>
