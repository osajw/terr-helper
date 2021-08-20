<template>
  <v-main class="History">
    <div class="territories">
      <v-card v-for="data in dataSorted" :key="data.type + data.id" class="territory" outlined>
        <v-card-subtitle>
          <template v-if="data.type == 'ter'">
            <span class="name">{{ data.name }}</span> <br>
            <v-icon v-if="data.outAt || data.inAt">{{ mdiCalendar }}</v-icon>
            <span v-if="data.outAt"> {{ $formatDate(data.outAt) }}</span>
            <span v-if="data.inAt"> - {{ $formatDate(data.inAt) }}</span>
            <template v-if="data.by && !data.inAt">
              <br>
              <v-icon>{{ mdiAccount }}</v-icon>
              {{ peopleName(data.by) }}
            </template>
          </template>
          <template v-else-if="data.type == 'npv'">
            <span class="name">
              {{ data.deleted ? 'Suppression' : 'Ajout/Modification' }} du npv dans "{{ terrName(data.territoryId) }}"
            </span><br>
            <p><span class="bold">Date :</span> {{ $formatDate(data.date) }}</p>
            <p><span class="bold">Adresse :</span> {{ data.address }}</p>
            <span v-if="data.planUrl" class="bold">Plan : <br></span>
          </template>
        </v-card-subtitle>
        <v-img v-if="data.type == 'npv' && data.planUrl" :src="data.planUrl" />
        <v-card-actions>
          <v-spacer />
          <span style="font-size: 14px;"><em>le: {{ $formatDate(data.updateAt, true, true) }}</em></span>
        </v-card-actions>
      </v-card>
    </div>
  </v-main>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { mdiCalendar, mdiAccount } from '@mdi/js'

export default {
  name: 'History',
  data () {
    return {
      mdiCalendar,
      mdiAccount
    }
  },
  computed: {
    ...mapState(['npvs']),
    ...mapGetters(['territoriesWithInfos']),
    dataSorted () {
      return [
        ...this.territoriesWithInfos.map(t => ({ ...t, type: 'ter' })),
        ...this.npvs.map(t => ({ ...t, type: 'npv' }))
      ].sort((a, b) =>
        (b.lastUpdate || new Date(b.updateAt)).getTime() - (a.lastUpdate || new Date(a.updateAt)).getTime()
      )
    }
  },
  methods: {
    peopleName (people) {
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
