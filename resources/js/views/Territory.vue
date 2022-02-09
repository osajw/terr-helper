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
    <v-btn class="fab-btn" color="primary" elevation="2" small fab @click="showDialogTerritory = true; editTerritoryId = 'new'">
      <v-icon>{{ mdiPlus }}</v-icon>
    </v-btn>
    <div class="content">
      <v-card :outlined="$vuetify.theme.dark" class="filters-2" elevation="0">
        <v-chip-group show-arrows>
          <span class="ml-2 mr-4">Trier par:</span>
          <v-chip :color="shortBy == 'name' ? 'green' : 'grey'" text-color="#fff" label link @click="setShortBy('name')">
            Nom <v-btn v-if="shortBy == 'name'" icon x-small dark><v-icon>{{ shortDesc ? mdiChevronDown : mdiChevronUp }}</v-icon></v-btn>
          </v-chip>
          <v-chip :color="shortBy == 'difficulty' ? 'green' : 'grey'" text-color="#fff" label link @click="setShortBy('difficulty')">
            Difficulté <v-btn v-if="shortBy == 'difficulty'" icon x-small dark><v-icon>{{ shortDesc ? mdiChevronDown : mdiChevronUp }}</v-icon></v-btn>
          </v-chip>
          <v-chip :color="shortBy == 'days' ? 'green' : 'grey'" text-color="#fff" label link @click="setShortBy('days')">
            Date <v-btn v-if="shortBy == 'days'" icon x-small dark><v-icon>{{ shortDesc ? mdiChevronDown : mdiChevronUp }}</v-icon></v-btn>
          </v-chip>
          <v-chip link @click="openSearch">
            <v-icon>{{ mdiMagnify }}</v-icon><span v-if="search">"{{ search }}"<v-icon>{{ mdiClose }}</v-icon></span>
          </v-chip>
        </v-chip-group>
      </v-card>
      <div v-if="selectedUser && filter === 'outBy'" style="height: 50px; max-width: 600px; margin: auto">
        <v-list-item-title class="d-flex justify-space-between">
          <span class="text-h5 px-6"><b>Sorti par {{ peopleName(peoplesById[selectedUser]) }}</b></span>
          <v-btn icon @click="showDialogPeople = true; editPeopleId = selectedUser">
            <v-icon>{{ mdiPencil }}</v-icon>
          </v-btn>
        </v-list-item-title>
      </div>
      <v-alert v-if="!territoriesFiltered.length" border="left" close-text="Fermer" type="info" class="mt-6" style="max-width: 800px; margin: auto" text>
      Vous n'avez aucun territoire pour le moment. Vous pouvez en créer un via le bouton <v-btn color="primary" elevation="2" x-small fab><v-icon>{{ mdiPlus }}</v-icon></v-btn> en bas. <br>
      Vous pouvez aussi en importer via le bouton <v-btn :light="!$vuetify.theme.dark" :dark="$vuetify.theme.dark" fab elevation="2" x-small><v-icon>{{ mdiDotsVertical }}</v-icon></v-btn> en haut à droite.
      </v-alert>
      <v-virtual-scroll v-else :items="territoriesSorted" :height="height - 64 * 4 - (selectedUser ? 50 : 0)" bench="3" item-height="160">
        <template v-slot:default="{ item: terr, index }">
          <v-card outlined>
            <v-alert v-if="terr.oldWithdrawal" border="left" type="success" dense style="position: absolute;right: 0;top: 0;left: 0; border-radius: 4px 4px 0 0;">Rentré</v-alert>
            <v-list-item :style="terr.oldWithdrawal ? 'margin-top: 45px': ''" three-line>
              <v-list-item-content>
                <v-list-item-title class="d-flex flex-nowrap">
                  <span><b>{{ terr.name }}</b></span>
                  <v-btn :class="['ml-2', {grey: !$vuetify.theme.dark}, 'lighten-2']" icon x-small>{{ terr.difficulty }}</v-btn>
                </v-list-item-title>
                <v-list-item-subtitle class="d-flex flex-nowrap my-2">
                  <v-chip class="flex-shrink-0 mr-2" outlined>
                    <v-icon v-if="terr.outAt || terr.inAt">{{ mdiCalendar }}</v-icon>
                    <span class="red--text" v-else>Jamais sorti</span>
                    <span v-if="terr.outAt"> {{ $formatDate(terr.outAt) }}</span>
                    <span v-if="terr.inAt"> - {{ $formatDate(terr.inAt) }}</span>
                  </v-chip>
                  <v-chip v-if="!terr.oldWithdrawal && terr.inAt" :color="terr.needOut ? 'red' : 'green'" outlined>{{ terr.daysIn }}j</v-chip>
                  <v-chip v-else-if="!terr.oldWithdrawal && terr.outAt" :color="terr.needIn ? 'red' : 'green'" outlined>{{ terr.daysOut }}j</v-chip>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="!terr.oldWithdrawal" class="d-flex flex-nowrap">
                  <v-btn v-if="terr.needOut || terr.inAt" :color="terr.needOut ? 'warning' :''" :outlined="!terr.needOut" :small="!terr.needOut" @click="inOrOut(terr)">
                    <span>Sortir</span>
                    <v-icon small>{{ terr.needOut ? mdiClockAlertOutline : mdiBookArrowRightOutline }}</v-icon>
                  </v-btn>
                  <v-btn v-if="terr.needIn || (terr.outAt && !terr.inAt)" :color="terr.needIn ? 'red' :''" :outlined="!terr.needIn" :small="!terr.needIn" @click="inOrOut(terr, true)">
                    <span>Rentrer</span>
                    <v-icon small>{{ terr.needIn ? mdiClockAlertOutline : mdiBookArrowLeftOutline }}</v-icon>
                  </v-btn>
                  <span v-if="terr.by && !terr.inAt" class="flex-shrink-0 ml-2">
                    <v-icon>{{ mdiAccount }}</v-icon> {{ peopleName(terr.by) }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn v-if="!terr.oldWithdrawal" icon @click="showDialogTerritory = true; editTerritoryId = terr.id">
                  <v-icon>{{ mdiPencil }}</v-icon>
                </v-btn>
                <v-btn icon @click="viewTerritory = index">
                  <v-icon>{{ mdiImage }}</v-icon>
                </v-btn>
                <v-btn v-if="!terr.oldWithdrawal && wepShareOk" icon @click="share(terr)">
                  <v-icon>{{ mdiShareVariant }}</v-icon>
                </v-btn>
                <v-btn v-else-if="!terr.oldWithdrawal" icon @click="print(terr)">
                  <v-icon>{{ mdiFileExportOutline }}</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </template>
      </v-virtual-scroll>
    </div>
    <v-dialog v-model="showDialogSelectUser" max-width="600px" transition="dialog-bottom-transition" fullscreen hide-overlay>
      <v-card>
        <v-toolbar color="primary" dense dark>
          <v-btn icon dark @click="showDialogSelectUser = false; filter = ''; searchPeople = ''">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-toolbar-title>Trouver une personne</v-toolbar-title>
        </v-toolbar>
        <v-text-field v-model="searchPeople" ref="searchUser" placeholder="Recherche" class="mx-4" clearable />
        <v-virtual-scroll :bench="1" :items="filteredPeoples" :height="height - 175" item-height="66">
          <template v-slot:default="{ item }">
            <v-list-item :key="item.id" @click="selectedUser = item.id; showDialogSelectUser = false; searchPeople = ''" style="height: 66px">
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon>{{ mdiAccount }}</v-icon> {{ peopleName(item) }}
                  <v-chip>{{ nOutBy(item) }}</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="item.email">{{ item.email }}</span>
                  <span v-if="item.phone && item.email"> | </span>
                  <span v-if="item.phone">{{ item.phone }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon small @click.stop="showDialogPeople = true; editPeopleId = item.id; searchPeople = ''">{{ mdiPencil }}</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-divider />
          </template>
        </v-virtual-scroll>
        <v-card-actions>
          <v-spacer />
          <v-btn color="warning" text @click="showDialogSelectUser = false; filter = ''; searchPeople = ''">Annuler</v-btn>
          <v-btn color="success" text @click="showDialogPeople = true; editPeopleId = 'new'; searchPeople = ''">Ajouter</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :value="dialogSelectPeople" max-width="300" @input="cbSelectPeople()">
      <v-card>
        <v-card-title>Envoyer à ?</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedPeopleId"
            :items="sortedPeoples"
            :item-text="peopleName"
            label="Personne :"
            item-value="id"
            clearable
          >
            <template v-slot:selection="data">
              <span>{{ data.item.firstname }} {{ data.item.lastname }}</span>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning darken-1" text @click="cbSelectPeople(true)">
            Annuler
          </v-btn>
          <v-btn color="green darken-1" text @click="cbSelectPeople()">
            Envoyer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSearch" content-class="Territory__search" hide-overlay>
      <v-card>
        <v-text-field v-model="search" ref="searchInput" placeholder="Recherche" @blur="onSearchBlur" @keydown="onSearchKey" />
        <v-btn icon @click="search = ''; showSearch = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
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
    <vue-easy-lightbox
      :visible="viewTerritory != -1"
      :imgs="territoriesSorted.map(t => $terrUrl(t.name))"
      :index="viewTerritory"
      @hide="viewTerritory = -1"
    />
  </v-main>
</template>

<script>
import { mdiRedoVariant, mdiCalendar, mdiMagnify, mdiClose, mdiAccount, mdiPencil, mdiImage, mdiPlus, mdiDotsVertical, mdiFileExportOutline, mdiShareVariant, mdiClockAlertOutline, mdiBookArrowRightOutline, mdiBookArrowLeftOutline, mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { mapGetters } from 'vuex'
import { printTerr } from '../utilities/print'
import DialogWithdrawal from '../components/DialogWithdrawal'
import DialogTerritory from '../components/DialogTerritory'
import DialogPeople from '../components/DialogPeople'
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'Territory',
  components: {
    DialogWithdrawal, DialogTerritory, DialogPeople, VueEasyLightbox
  },
  data () {
    return {
      mdiRedoVariant,
      mdiCalendar,
      mdiMagnify,
      mdiClose,
      mdiAccount,
      mdiPencil,
      mdiImage,
      mdiPlus,
      mdiDotsVertical,
      mdiFileExportOutline,
      mdiShareVariant,
      mdiClockAlertOutline,
      mdiBookArrowRightOutline,
      mdiBookArrowLeftOutline,
      mdiChevronDown,
      mdiChevronUp,
      today: new Date(),
      height: window.innerHeight,
      filter: '',
      shortBy: 'name',
      shortDesc: false,
      showDialogWithdrawal: false,
      editWithdrawalId: '',
      searchPeople: '',
      showDialogPeople: false,
      editPeopleId: '',
      territoryId: '',
      setIn: false,
      setOut: false,
      search: '',
      showSearch: false,
      showDialogTerritory: false,
      editTerritoryId: '',
      viewTerritory: -1,
      wepShareOk: !!navigator.share,
      selectedPeopleId: '',
      dialogSelectPeople: false,
      cbSelectPeople: () => {},
      showDialogSelectUser: false,
      selectedUser: ''
    }
  },
  computed: {
    ...mapGetters(['territories', 'withdrawals', 'peoples', 'territoriesWithInfos']),
    territoriesById () { return this.territories.reduce((o, el) => { o[el.id] = el; return o }, {}) },
    peoplesById () { return this.peoples.reduce((o, el) => { o[el.id] = el; return o }, {}) },
    sortedPeoples () {
      return [...this.peoples].sort((a, b) => this.peopleName(a).localeCompare(this.peopleName(b)))
    },
    filteredPeoples () {
      const search = (this.searchPeople || '').toLowerCase()
      if (!search) { return this.sortedPeoples }
      return this.sortedPeoples.filter(p => this.peopleName(p).toLowerCase().includes(search))
    },
    territoriesFiltered () {
      let terrs = this.territoriesWithInfos.filter(t => !t.deleted_at)
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
        return terrs.filter(t => !t.inAt && t.by && t.by.id === this.selectedUser)
      }
      return terrs
    },
    territoriesSorted () {
      let terrs = this.sortTerrs([...this.territoriesFiltered], this.shortBy, this.shortDesc)
      if (this.filter === 'outBy') { // add old out
        const oldWithdrawals = this.withdrawals.filter(w => w.peopleId === this.selectedUser && w.inAt)
        const oldTerrs = oldWithdrawals.map(w => ({ ...this.territoriesById[w.territoryId], outAt: w.outAt, inAt: w.inAt,  oldWithdrawal: true }))
        terrs = terrs.concat(this.sortTerrs(oldTerrs, 'inAt', true))
      }
      return terrs
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
    setShortBy (type) {
      if (this.shortBy === type) {
        if (!this.shortDesc) {
          this.shortDesc = true
        } else {
          this.shortDesc = false
          this.shortBy = 'name' // default
        }
      } else {
        this.shortBy = type
        this.shortDesc = false
      }
    },
    filterPeoples (people, queryText) {
      return this.peopleName(people).includes(queryText.toLowerCase())
    },
    sortTerrs (terrs, shortBy, shortDesc) {
      terrs = terrs.sort((a,b) => a.name.localeCompare(b.name)) // default by name
      if (!shortBy) { return terrs }
      terrs = terrs.sort((a, b) => {
        if (shortBy === 'difficulty') { return a.difficulty - b.difficulty }
        if (shortBy === 'inAt') { return new Date(a.inAt).getTime() - new Date(b.inAt).getTime() }
        if (shortBy === 'days') {
          return (a.inAt ? a.daysIn : (a.outAt ? a.daysOut : Infinity)) -
            (b.inAt ? b.daysIn : (b.outAt ? b.daysOut : Infinity))
        }
        return 0
      })
      if (shortDesc) { terrs.reverse() }
      return terrs
    },
    print (terr) {
      printTerr(terr)
    },
    async share (terr) {
      this.selectedPeopleId = (terr.by || {}).id
      this.dialogSelectPeople = true
      this.cbSelectPeople = (cancel) => {
        this.dialogSelectPeople = false
        if (cancel) { return }
        const people = this.peoples.find(p => p.id === this.selectedPeopleId)
        printTerr(terr, people)
      }
    },
    openSearch () {
      if (this.search) { return (this.search = '') }
      this.showSearch = true
      setTimeout(() => this.$refs.searchInput.focus(), 10)
    },
    onSearchBlur () {
      this.showSearch = !this.search
    },
    onSearchKey (ev) {
      if (ev.key === 'Escape') {
        this.search = ''
        this.showSearch = false
      }
    },
    toggleFilterOutBy () {
      if (this.filter === 'outBy') {
        this.filter = ''
      } else {
        this.filter = 'outBy'
        this.showDialogSelectUser = true
        setTimeout(() => this.$refs.searchUser.focus(), 10)
      }
    },
    nOutBy ({ id }) {
      return this.territoriesWithInfos.filter(t => !t.inAt && t.by && t.by.id === id).length
    },
    peopleName (people) {
      return people ? `${people.firstname} ${people.lastname}` : 'Personne supprimée'
    }
  }
}
</script>

<style lang="scss">
.Territory {
  .v-main__wrap {
    padding: 0;
  }
  .filters, .filters-2 {
    z-index: 1;
    &.theme--light {
      background-color: #fff;
    }
    .v-slide-group__next, .v-slide-group__prev {
      min-width: 20px;
    }
  }
  .filters {
    position: fixed;
    bottom: 56px;
    left: 0;
    right: 0;
  }
  .filters-2 {
    padding: 10px 10px 0 10px;
    margin-bottom: 12px;
    border: 0;
    .v-slide-group__content {
      align-items: center;
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
    .v-virtual-scroll {
      .v-card {
        display: flex;
        align-items: center;
        max-width: 600px;
        min-height: 142px;
        margin: auto;
      }
    }
  }
  &__search {
    position: absolute;
    top: 0;
    max-width: 640px;
    .v-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
    }
  }
}
</style>
