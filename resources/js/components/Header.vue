<template>
  <v-app-bar class="Header" hide-on-scroll flat app>
    <v-toolbar-title>{{ $route.meta.title }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon :style="`transform: rotate(${$vuetify.theme.dark ? '18' : '0'}0deg)`" @click="setDarkMode">
      <v-icon>{{ mdiThemeLightDark }}</v-icon>
    </v-btn>
    <v-menu content-class="Header_vmenu" transition="slide-y-transition" bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>{{ mdiDotsVertical }}</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title class="colored" @click="importData"><v-icon>{{ mdiDownloadOutline }}</v-icon> Importer</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-list-item-title @click="exportData('s13')"><v-icon>{{ mdiFilePdf }}</v-icon> S-13</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title @click="exportData('json')"><v-icon>{{ mdiFileCodeOutline }}</v-icon> .JSON</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog :value="dataToUpdate" content-class="Header__DialogDataToCheck" transition="dialog-bottom-transition" fullscreen hide-overlay>
      <v-card>
        <v-toolbar color="primary" dense dark>
          <v-toolbar-title>Vérificaton</v-toolbar-title>
        </v-toolbar>
        <v-card-text>Données importées mais modifiées plus récemment par vous :</v-card-text>
        <div v-if="dataToUpdate" class="table-check">
          <span class="h c2">{{ dataToUpdate.name }}</span>
          <span class="h">Actuelle</span>
          <span class="h">Importée</span>
          <span>{{ $formatDate(dataToUpdate.current.updated_at, true, true) }}</span>
          <span>{{ $formatDate(dataToUpdate.imported.updated_at, true, true) }}</span>
          <template v-for="key in dataToUpdate.keys">
            <template v-if="['outAt', 'inAt', 'date'].includes(key)">
              <span :key="'a'+key">{{ $formatDate(dataToUpdate.current[key]) }}</span>
              <span :key="'b'+key">{{ $formatDate(dataToUpdate.imported[key]) }}</span>
            </template>
            <template v-else-if="['territoryId', 'peopleId'].includes(key)">
              <span :key="'a'+key">{{ getNameFromId(key, dataToUpdate.current[key]) }}</span>
              <span :key="'b'+key">{{ getNameFromId(key, dataToUpdate.imported[key]) }}</span>
            </template>
            <template v-else-if="dataToUpdate.current[key] != undefined && dataToUpdate.imported[key] != undefined">
              <span :key="'a'+key">{{ dataToUpdate.current[key] }}</span>
              <span :key="'b'+key">{{ dataToUpdate.imported[key] }}</span>
            </template>
          </template>
        </div>
        <v-card-actions>
          <v-btn class="mr-4" color="warning" text @click="dataToCheck.pop()">Annuler</v-btn>
          <v-btn class="mr-4" color="success" @click="validData">Valider la modification</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogPassword" content-class="Header__DialogPassword" max-width="600px" transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary" dense dark>
          <v-toolbar-title>Entrer un mot de passe :</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="aPassword" label="Mot de passe" />
          <template v-if="isExport">
            <p v-if="aPassword" class="green--text">Le fichier sera crypté !</p>
            <p v-else class="red--text">Sans mot de passe, le fichier ne sera pas crypté !</p>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn class="mr-4" color="success" @click="validPassword">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
import { mdiThemeLightDark, mdiDotsVertical, mdiDownloadOutline, mdiFilePdf, mdiFileCodeOutline } from '@mdi/js'

export default {
  name: 'Header',
  data () {
    return {
      mdiThemeLightDark,
      mdiDotsVertical,
      mdiDownloadOutline,
      mdiFilePdf,
      mdiFileCodeOutline,
      loading: false,
      dataToCheck: [],
      isExport: false,
      dialogPassword: false,
      aPassword: ''
    }
  },
  computed: {
    dataToUpdate () {
      if (!this.dataToCheck.length) { return null }
      const last = this.dataToCheck.slice(-1)[0]
      const trads = { territories: 'Territoires', peoples: 'Personnes', withdrawals: 'Sorties', npvs: 'Personnes à ne pas visiter' }
      const id = last.data.id
      const current = this.$store.state[last.name].find(s => s.id === id) || {}
      return {
        name: trads[last.name],
        keys: [...new Set([...Object.keys(current), ...Object.keys(last.data)])].filter(k => !['id', 'updated_at'].includes(k)),
        current,
        imported: last.data
      }
    }
  },
  methods: {
    importData () {
      this.loading = true
      this.$store.dispatch('import', () => {
        this.dialogPassword = true
        this.isExport = false
        return new Promise((resolve, reject) => {
          this._resolvePassord = () => {
          this.dialogPassword = false
            resolve()
          }
        })
      }).then((needUserCheck) => {
        this.loading = false
        this.aPassword = ''
        if (needUserCheck.length) {
          this.dataToCheck = needUserCheck
        }
      })
    },
    exportData (format) {
      if (format === 'json') {
        this.dialogPassword = true
        this.isExport = true
        this._resolvePassord = (password) => {
          this.$store.dispatch('export', { format, password }).then(() => {
            this.dialogPassword = false
            this.aPassword = ''
          })
        }
      } else {
        this.$store.dispatch('export', { format })
      }
    },
    setDarkMode () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.$store.dispatch('setPref', { key: 'darkmode', val: this.$vuetify.theme.dark })
    },
    validData () {
      const last = this.dataToCheck.pop()
      this.$store.dispatch('updateData', { ...last, noUpdateAt: true })
    },
    getNameFromId (key, id) {
      if (key === 'territoryId') {
        return (this.$store.state.territories.find(t => t.id === id) || {}).name || '?'
      }
      if (key === 'peopleId') {
        const people = this.$store.state.peoples.find(p => p.id === id)
        return people ? `${people.firstname} ${people.lastname}` : 'Personne supprimée'
      }
      return '?'
    },
    validPassword () {
      if (this._resolvePassord) {
        this._resolvePassord(this.aPassword)
      }
    }
  }
}
</script>

<style lang="scss">
.Header {
  .v-toolbar__content {
    box-shadow: 0 3px 30px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }
  &_vmenu {
    .colored {
      color: var(--v-anchor-base);
    }
    .v-list-item {
      cursor: pointer;
      transition: .5s ease all;
      &:hover {
        background-color: #F5F5F5;
      }
    }
  }
  &__DialogDataToCheck, &__DialogPassword {
    .v-card {
      &__text {
        padding-top: 14px !important;
        padding-bottom: 0 !important;
      }
      &__actions {
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-top: 10px;
      }
    }
  }
  &__DialogDataToCheck {
    .table-check {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      margin: 12px 24px 0 24px;
      background-color: #e0e0e0;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      span {
        background-color: #fff;
        padding: 6px 4px;
        &.c2 {
          grid-column-end: span 2;
        }
        &.h {
          text-align: center;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
