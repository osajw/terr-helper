<template>
  <v-main class="History">
    <div class="territories">
      <v-card v-for="data in dataSorted" :key="data.type + data.id" class="territory" outlined>
        <v-card-subtitle class="pb-0">
          
          <template v-if="data.type === 'Territoire'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ data.type }} - <span class="name">{{ data.name }}</span></div>
              <v-chip x-small>{{ data.created_at === data.updated_at ? 'Création' : ( data.deleted_at ? 'Suppression' : 'Mise à jour') }}</v-chip>
            </div>
          </template>

          <template v-else-if="data.type === 'Entré/sortie'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ data.type }} - <span class="name">{{ terrName(data.territoryId) }}</span></div>
              <v-chip x-small>{{ data.created_at === data.updated_at ? 'Ajout' : ( data.deleted_at ? 'Suppression' : 'Mise à jour') }}</v-chip>
            </div>
            <v-chip class="mb-1" label small><v-icon left>{{ mdiAccount }}</v-icon> {{ peopleName(data.peopleId) }}</v-chip> <br>
            <v-icon v-if="data.outAt || data.inAt">{{ mdiCalendar }}</v-icon>
            <span v-if="data.outAt"> {{ $formatDate(data.outAt) }}</span>
            <span v-if="data.inAt"> - {{ $formatDate(data.inAt) }}</span>
          </template>

          <template v-else-if="data.type === 'Personne'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ data.type }} - <span class="name">{{ peopleName(data) }}</span></div>
              <v-chip x-small>{{ data.created_at === data.updated_at ? 'Ajout' : ( data.deleted_at ? 'Suppression' : 'Mise à jour') }}</v-chip>
            </div>
            <v-chip class="mb-1" label small><v-icon left>{{ mdiEmail }}</v-icon> {{ data.email }}</v-chip> <br>
            <v-chip label small><v-icon left>{{ mdiPhone }}</v-icon> {{ data.phone }}</v-chip>
          </template>

          <template v-else-if="data.type === 'NPV'">
            <div class="d-flex justify-space-between align-center">
              <div>{{ data.type }} - <span class="name">{{ terrName(data.territoryId) }}</span></div>
              <v-chip x-small>{{ data.created_at === data.updated_at ? 'Ajout' : ( data.deleted_at ? 'Suppression' : 'Mise à jour') }}</v-chip>
            </div>
            <v-img v-if="data.planUrl" :src="`./images/${data.planUrl}`" />
            <v-chip label small><v-icon left>{{ mdiMapMarker }}</v-icon> {{ data.address }}</v-chip>
          </template>

        </v-card-subtitle>
        <v-card-actions>
          <v-spacer />
          <span style="font-size: 14px;"><em>le: {{ $formatDate(data.updated_at, true, true) }}</em></span>
        </v-card-actions>
      </v-card>
      <div class="d-flex justify-center my-4">
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
        ...this.npvs.map(t => ({ ...t, type: 'NPV' })),
        ...this.peoples.map(t => ({ ...t, type: 'Personne' })),
        ...this.territories.map(t => ({ ...t, type: 'Territoire' })),
        ...this.withdrawals.map(t => ({ ...t, type: 'Entré/sortie' })) 
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
       .slice(0, this.maxItems)
    }
  },
  methods: {
    peopleName (people) {
      if (typeof people === 'string') {
        people = this.peoples.find(p => p.id === people)
      }
      return people ? `${people.firstname} ${people.lastname}` : 'Personne supprimée'
    },
    terrName (terrId) {
      return (this.territoriesWithInfos.find(t => t.id === terrId) || {}).name || 'Territoire supprimé'
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
