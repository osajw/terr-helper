<template>
  <v-app>
    <Header />
    <v-expand-transition>
      <router-view/>
    </v-expand-transition>
    <BottomNav />
  </v-app>
</template>

<script>
import Header from './components/Header.vue'
import BottomNav from './components/BottomNav.vue'

export default {
  name: 'Home',
  components: {
    Header, BottomNav
  },
  created () {
    this.$store.dispatch('fetchPref').then((prefs) => {
      this.$vuetify.theme.dark = prefs.darkmode
    })
  }
}
</script>

<style lang="scss">
*, *::after, *::before {
    box-sizing: border-box;
}

* {
  scrollbar-color: var(--v-secondary-base) transparent; // Firefox
  scrollbar-width: 8px; // Firefox

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: var(--v-secondary-base);
  }
}

html, body {
  overflow: auto !important;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-main {
  &__wrap {
    padding: 10px 10px 66px 10px;
  }
}
</style>
