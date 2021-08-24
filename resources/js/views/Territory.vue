<template>
  <v-main class="Territory">
    <v-card :outlined="$vuetify.theme.dark" class="filters" tile>
      <v-chip-group show-arrows>
        <v-chip class="ma-2" color="red darken-1" :outlined="filter == 'toIn'" :text-color="filter == 'toIn' ? '' : 'white'"  label link @click="filter = filter == 'toIn' ? '' : 'toIn'">
          <v-icon left>{{ mdiRedoVariant }}</v-icon>À rentrer
        </v-chip>
        <v-chip class="ma-2" color="orange darken-1" :outlined="filter == 'toOut'" :text-color="filter == 'toOut' ? '' : 'white'"  label link @click="filter = filter == 'toOut' ? '' : 'toOut'">
          <v-icon left style="transform: rotate(180deg)">{{ mdiRedoVariant }}</v-icon>À sortir
        </v-chip>
        <v-chip class="ma-2" color="primary darken-1" :outlined="filter == 'outBy'" :text-color="filter == 'outBy' ? '' : 'white'" label link @click="toggleFilterOutBy">
          Sorti par
        </v-chip>
        <v-chip class="ma-2" label link :outlined="!filter"  @click="filter = ''">
          Tous
        </v-chip>
      </v-chip-group>
    </v-card>
    <v-app-bar :collapse="collapseBar" flat inverted-scroll app>
      <v-btn v-show="collapseBar" icon @click="collapseBar = false">
        <v-icon>{{ mdiMagnify }}</v-icon>
      </v-btn>
      <v-toolbar-title>
        <input v-model="search" placeholder="Recherche" @blur="onSearchBlur" />
        <v-btn icon @click="search = ''; collapseBar = true">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
      </v-toolbar-title>
    </v-app-bar>
    <v-btn class="fab-btn" color="primary" elevation="2" small fab @click="showDialogTerritory = true; editTerritoryId = 'new'">
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>
    <div class="content">
      <div class="territories">
        <v-card v-for="terr in territoriesFiltered" :key="terr.id" class="territory" elevation="1" tile>
          <v-card-title>
            <span>{{ terr.name }}</span>
            <v-btn icon @click="showDialogTerritory = true; editTerritoryId = terr.id">
              <v-icon>{{ mdiPencil }}</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-subtitle>
            <v-icon v-if="terr.outAt || terr.inAt">{{ mdiCalendar }}</v-icon>
            <span v-if="terr.outAt"> {{ $formatDate(terr.outAt) }}</span>
            <span v-if="terr.inAt"> - {{ $formatDate(terr.inAt) }}</span>
            <span v-if="terr.inAt"> ({{ terr.daysIn }}) jour{{ terr.daysIn>1?'s':'' }}</span>
            <span v-else-if="terr.outAt"> ({{ terr.daysOut }}) jour{{ terr.daysOut>1?'s':'' }}</span>
            <template v-if="terr.by && !terr.inAt">
              <br>
              <v-icon>{{ mdiAccount }}</v-icon>
              {{ peopleName(terr.by) }}
            </template>
          </v-card-subtitle>
          <v-card-actions>
            <v-badge v-if="terr.needOut || terr.inAt" :value="terr.needOut" color="error" overlap dot>
              <v-btn :x-small="!terr.needOut" color="primary" text @click="inOrOut(terr)">Sortir</v-btn>
            </v-badge>
            <v-badge v-if="terr.needIn || (terr.outAt && !terr.inAt)" :value="terr.needIn" color="error" overlap dot>
              <v-btn :x-small="!terr.needIn" color="accent" text @click="inOrOut(terr, true)">Rentrer</v-btn>
            </v-badge>
            <v-spacer />
            <v-btn icon @click="print(terr)">
              <v-icon>{{ mdiFileExportOutline }}</v-icon>
            </v-btn>
            <v-btn v-if="navShare" icon @click="share(terr)">
              <v-icon>{{ mdiShareVariant }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>
    <v-dialog v-model="showDialogSelectUser" max-width="600px" transition="dialog-bottom-transition" fullscreen hide-overlay>
      <v-card>
        <v-toolbar color="primary" dense dark>
          <v-btn icon dark @click="showDialogSelectUser = false">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-toolbar-title>Trouver une personne</v-toolbar-title>
        </v-toolbar>
        <v-virtual-scroll :bench="1" :items="peoples" :height="height - 100" item-height="66">
          <template v-slot:default="{ item }">
            <v-list-item :key="item.id" @click="selectedUser = item.id; showDialogSelectUser = false" style="height: 66px">
              <v-list-item-content>
                <v-list-item-title><v-icon>{{ mdiAccount }}</v-icon> {{ peopleName(item) }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="item.email">{{ item.email }}</span>
                  <span v-if="item.phone && item.email"> | </span>
                  <span v-if="item.phone">{{ item.phone }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon small @click.stop="showDialogPeople = true; editPeopleId = item.id">{{ mdiPencil }}</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-divider />
          </template>
        </v-virtual-scroll>
        <v-card-actions>
          <v-spacer />
          <v-btn color="success" text @click="showDialogPeople = true; editPeopleId = 'new'">Ajouter</v-btn>
          <v-btn color="warning" text @click="showDialogSelectUser = false; filter = ''">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DialogWithdrawal
      :visibility.sync="showDialogWithdrawal"
      :id="editWithdrawalId"
      :territoryId="territoryId"
      :set-in="setIn"
      :set-out="setOut"
    />
    <DialogPeople :visibility.sync="showDialogPeople" :id="editPeopleId" />
    <DialogTerritory :visibility.sync="showDialogTerritory" :id="editTerritoryId" />
  </v-main>
</template>

<script>
import { mdiRedoVariant, mdiCalendar, mdiMagnify, mdiClose, mdiAccount, mdiPencil, mdiPlus, mdiFileExportOutline, mdiShareVariant } from '@mdi/js'
import { mapState, mapGetters } from 'vuex'
import { printTerr } from '../utilities/print'
import DialogWithdrawal from '../components/DialogWithdrawal'
import DialogTerritory from '../components/DialogTerritory'
import DialogPeople from '../components/DialogPeople'

export default {
  name: 'Territory',
  components: {
    DialogWithdrawal, DialogTerritory, DialogPeople
  },
  data () {
    return {
      mdiRedoVariant,
      mdiCalendar,
      mdiMagnify,
      mdiClose,
      mdiAccount,
      mdiPencil,
      mdiPlus,
      mdiFileExportOutline,
      mdiShareVariant,
      today: new Date(),
      height: document.body.offsetHeight,
      filter: '',
      showDialogWithdrawal: false,
      editWithdrawalId: '',
      showDialogPeople: false,
      editPeopleId: '',
      territoryId: '',
      setIn: false,
      setOut: false,
      search: '',
      collapseBar: true,
      showDialogTerritory: false,
      editTerritoryId: '',
      showDialogSelectUser: false,
      selectedUser: ''
    }
  },
  computed: {
    ...mapState(['territories', 'withdrawals', 'peoples']),
    ...mapGetters(['territoriesWithInfos']),
    withdrawalsByTerrId () {
      return this.withdrawals.reduce((obj, w) => {
        if (!obj[w.territoryId]) { obj[w.territoryId] = [] }
        obj[w.territoryId].push(w)
        return obj
      }, {})
    },
    territoriesFiltered () {
      let terrs = this.territoriesWithInfos
      if (this.search) {
        const search = this.search.toLowerCase()
        terrs = terrs.filter(t => t.name.toLowerCase().includes(search) || this.peopleName(t.by).toLowerCase().includes(search))
      }
      if (this.filter === 'toIn') {
        return [...terrs.filter(t => t.needIn)].sort((a, b) =>
          new Date(a.outAt).getTime() - new Date(b.outAt).getTime()
        )
      }
      if (this.filter === 'toOut') {
        return [...terrs.filter(t => t.needOut)].sort((a, b) =>
          new Date(a.inAt || -1).getTime() - new Date(b.inAt || -1).getTime()
        )
      }
      if (this.filter === 'outBy') {
        return terrs.filter(t => t.by && t.by.id === this.selectedUser)
      }
      return terrs
    },
    navShare () {
      return navigator.share
    }
  },
  methods: {
    inOrOut (terr, toIn = false) {
      if (!terr.withdrawals.length || terr.withdrawals.slice(-1)[0].inAt) {
        this.editWithdrawalId = 'new'
      } else {
        this.editWithdrawalId = terr.withdrawals.slice(-1)[0].id
      }
      this.territoryId = terr.id
      this.setIn = toIn
      this.setOut = !toIn
      this.showDialogWithdrawal = true
    },
    print (terr) {
      printTerr(terr)
    },
    async share (terr) {
      printTerr(terr, { firstname: '.....' })
    },
    onSearchBlur () {
      this.collapseBar = !this.search
    },
    toggleFilterOutBy () {
      if (this.filter === 'outBy') {
        this.filter = ''
      } else {
        this.filter = 'outBy'
        this.showDialogSelectUser = true
      }
    },
    peopleName (people) {
      return people ? `${people.firstname} ${people.lastname}` : 'Personne supprimée'
    }
  }
}
</script>

<style lang="scss">
.Territory {
  .filters {
    position: fixed;
    bottom: 56px;
    left: 0;
    right: 0;
    z-index: 1;
    .v-slide-group__next, .v-slide-group__prev {
      min-width: 20px;
    }
  }
  .v-toolbar {
    &__title {
      width: 100%;
      input {
        width: 100%;
      }
      .v-btn {
        position: absolute;
        top: 5px;
        right: 5px;
      }
    }
  }
  .fab-btn {
    position: fixed;
    bottom: 118px;
    right: 10px;
    z-index: 99;
  }
  .content {
    padding: max(58px, 6vw) 0 58px 0;
    .territories {
      max-width: 1200px;
      margin: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 10px;
      .territory {
        .v-card__title {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 24px;
          padding-bottom: 4px;
          > span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }
          .v-btn {
            flex-shrink: 0;
          }
        }
        .v-card__subtitle {
          padding-bottom: 0;
          margin-top: 0;
        }
      }
    }
  }
}
</style>
