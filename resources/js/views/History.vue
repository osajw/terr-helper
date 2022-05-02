<template>
  <v-main class="History">
    <v-alert v-if="!dataSorted.length" border="left" close-text="Fermer" type="info" class="mt-6" style="max-width: 800px; margin: auto" text>{{ $t('history.noData') }}</v-alert>
    <div v-else class="territories">
      <v-card v-for="data in dataSorted.slice(0, maxItems)" :key="data.type + data.id" class="territory" outlined>
        <v-card-subtitle class="pb-0">
          
          <template v-if="data.type === 'terr'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ $t('territory.label') }} - <span class="name">{{ data.name }}</span></div>
              <v-chip x-small>{{ infoType(data, 'creation') }}</v-chip>
            </div>
          </template>

          <template v-else-if="data.type === 'inOut'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ $t('territory.inOut') }} - <span class="name">{{ terrName(data.territoryId) }}</span></div>
              <v-chip x-small>{{ infoType(data) }}</v-chip>
            </div>
            <v-chip class="mb-1" label small><v-icon left>{{ mdiAccount }}</v-icon> {{ peopleName(data.peopleId) }}</v-chip> <br>
            <v-icon v-if="data.outAt || data.inAt">{{ mdiCalendar }}</v-icon>
            <span v-if="data.outAt"> {{ $formatDate(data.outAt) }}</span>
            <span v-if="data.inAt"> - {{ $formatDate(data.inAt) }}</span>
          </template>

          <template v-else-if="data.type === 'people'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ $t('territory.people') }} - <span class="name">{{ peopleName(data) }}</span></div>
              <v-chip x-small>{{ infoType(data) }}</v-chip>
            </div>
            <v-chip class="mb-1" label small><v-icon left>{{ mdiEmail }}</v-icon> {{ data.email }}</v-chip> <br>
            <v-chip label small><v-icon left>{{ mdiPhone }}</v-icon> {{ data.phone }}</v-chip>
          </template>

          <template v-else-if="data.type === 'novisit'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ $t('territory.doNotVisit') }} - <span class="name">{{ terrName(data.territoryId) }}</span></div>
              <v-chip x-small>{{ infoType(data) }}</v-chip>
            </div>
            <v-img v-if="data.planUrl" :src="$npvUrl(data.planUrl)" />
            <v-chip label small><v-icon left>{{ mdiMapMarker }}</v-icon> {{ data.address }}</v-chip>
          </template>

        </v-card-subtitle>
        <v-card-actions>
          <v-spacer />
          <span style="font-size: 14px;"><em>{{ $t('history.at') }} {{ $formatDate(data.updated_at, true) }}</em></span>
        </v-card-actions>
      </v-card>
      <div v-if="dataSorted.length > maxItems" class="d-flex justify-center my-4">
        <v-btn color="primary" fab @click="maxItems += 10"><v-icon>{{ mdiPlus }}</v-icon></v-btn>
      </div>
    </div>
  </v-main>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { mdiCalendar, mdiAccount, mdiPlus, mdiEmail, mdiPhone, mdiMapMarker } from '@mdi/js'

export default {
  name: 'History',
  data () {
    return {
      mdiCalendar,
      mdiAccount,
      mdiPlus,
      mdiEmail,
      mdiPhone,
      mdiMapMarker,
      maxItems: 10
    }
  },
  computed: {
    ...mapState(['npvs', 'peoples', 'territories', 'withdrawals']),
    ...mapGetters(['territoriesWithInfos']),
    dataSorted () {
      return [
        ...this.npvs.map(t => ({ ...t, type: 'novisit' })),
        ...this.peoples.map(t => ({ ...t, type: 'people' })),
        ...this.territories.map(t => ({ ...t, type: 'terr' })),
        ...this.withdrawals.map(t => ({ ...t, type: 'inOut' })) 
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }
  },
  methods: {
    peopleName (people) {
      if (typeof people === 'string') {
        people = this.peoples.find(p => p.id === people)
      }
      return people ? `${people.firstname} ${people.lastname}` : this.$t('territory.peopleDeleted')
    },
    terrName (terrId) {
      return (this.territoriesWithInfos.find(t => t.id === terrId) || {}).name || this.$t('territory.deleted')
    },
    infoType (data, keyForAdd = 'add') {
      if (data.created_at === data.updated_at) { this.$t(`history.${keyForAdd}`) }
      return this.$t(`history.${data.deleted_at ? 'deletion' : 'update'}`)
    }
  }
}
</script>

<style lang="scss">
.History {
  .territories {
    padding: max(58px, 6vw) 0 0 0;
    max-width: 400px;
    margin: auto;
    .territory {
      .name {
        font-weight: bold;
      }
      + .territory {
        margin-top: 10px;
      }
      .bold {
        font-weight: bold;
      }
      p {
        margin-top: 6px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
