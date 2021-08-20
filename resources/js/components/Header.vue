<template>
  <v-app-bar class="Header" flat>
    <router-link to="/">
      <h1>Terr Helper</h1>
    </router-link>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.Header {
  a {
    text-decoration: none;
    color: var(--txt-color);
  }
}
</style>
