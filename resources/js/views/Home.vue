<template>
  <v-main class="Home">
    <Header />
    <div class="content">
      <section>
        <v-btn color="primary" block x-large @click="toggle('out')">Sortir</v-btn>
        <v-expand-transition>
          <SectionOut v-show="section === 'out'" />
        </v-expand-transition>
      </section>
      <section>
        <v-btn color="primary" block x-large @click="toggle('in')">Rentrer</v-btn>
        <v-expand-transition>
          <SectionIn v-show="section === 'in'" />
        </v-expand-transition>
      </section>
      <section>
        <h2>A Rentrer :</h2>
        <TerrList :list="toEnter" />
      </section>
    </div>
  </v-main>
</template>

<script>
import Header from '../components/Header'
import SectionIn from '../components/SectionIn'
import SectionOut from '../components/SectionOut'
import TerrList from '../components/TerrList'

export default {
  name: 'Home',
  components: {
    Header, SectionIn, SectionOut, TerrList
  },
  data () {
    return {
      section: '',
      toEnter: [ // TODO: from store
        { id: 't1', name: 'SB001', currentOwner: 'Tester B.', outAt: '2021-02-13T23:00:00.000Z' }
      ]
    }
  },
  methods: {
    toggle (section) {
      this.section = this.section === section ? '' : section
    }
  }
}
</script>

<style lang="scss">
.Home {
  h1, h2 {
    font-size: 20px;
  }
  .content {
    margin-top: 16px;
    padding: 10px;
    max-width: 600px;
    margin: auto;
    section {
      margin-bottom: 16px;
    }
  }
}
</style>
