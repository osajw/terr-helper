<template>
  <div class="TerrList">
    <v-card v-for="terr in list" :key="terr.id" outlined>
      <v-list-item three-line>
        <v-list-item-content>
          <div class="text-overline mb-4">
            {{ terr.currentOwner }}
          </div>
          <v-list-item-title class="text-h5 mb-1">
            {{ terr.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span v-if="terr.outAt" class="outAt">{{ formatDate(terr.outAt) }}</span>
            <span v-if="terr.inAt" class="inAt">{{ formatDate(terr.inAt) }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-avatar tile size="80" color="grey"></v-list-item-avatar>
      </v-list-item>
      <v-card-actions>
        <v-btn v-if="!noSee" icon color="primary"><v-icon>{{ icons.mdiEyeOutline }}</v-icon></v-btn>
        <v-checkbox v-if="selected" :value="selected.includes(terr.id)" @click="select(terr)" />
    </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mdiEyeOutline } from '@mdi/js'
export default {
  name: 'TerrList',
  props: {
    list: {
      type: Array,
      require: true
    },
    selected: {
      type: Array,
      default: () => null
    },
    noSee: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      icons: { mdiEyeOutline },
    }
  },
  methods: {
    select ({ id }) {
      const selected = [...this.selected]
      const i = this.selected.indexOf(id)
      if (i !== -1) {
        selected.splice(i, 1)  
      } else {
        selected.push(id)
      }
      this.$emit('update:selected', selected)
    },
    formatDate (isoStr) {
      return new Date(isoStr).toLocaleString('fr-FR', { year: '2-digit', month: '2-digit', day: '2-digit' })
    }
  }
}
</script>

<style lang="scss">
// .TerrList {
//   //
// }
</style>
