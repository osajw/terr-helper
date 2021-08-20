<template>
  <div class="SectionOut">
    <h3>Pour :</h3>
    <v-autocomplete v-model="people" :items="peoples" item-text="name" item-value="id" label="🧍‍♂️ Sélectionnez quelqu'un" chips deletable-chips />
    <v-expand-transition>
      <div v-if="people" class="infos">
        <h4>A actuellement :</h4>
        <TerrList :list="peopleHave" />
        <h4>Territoires à sortir :</h4>
        <TerrList :list="toOut" :selected="selected" no-see />
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import TerrList from './TerrList'

export default {
  name: 'SectionOut',
  components: {
    TerrList
  },
  data () {
    return {
      people: '',
      selected: [],
      peoples: [ // TODO from store
        { id: 'p1', name: 'Tester B.' },
        { id: 'p2', name: 'Tester A.' },
      ],
      peopleHave: [ // TODO: computed from people & store
        { id: 't1', name: 'SB001', currentOwner: 'Tester B.', outAt: '2021-02-13T23:00:00.000Z' }
      ],
      toOut: [ // TODO: computed terr sorted by date toOut
        { id: 't1', name: 'SB001', currentOwner: 'Tester B.', outAt: '2021-02-13T23:00:00.000Z' },
        { id: 't2', name: 'SB002', currentOwner: 'Tester A.', outAt: '2021-02-10T00:00:00.000Z' }
      ]
    }
  }
}
</script>

<style lang="scss">
.SectionOut {
  padding: 10px 0;
  .v-chip__close::after {
    display: contents;
    content: '✖';
  }
}
</style>
